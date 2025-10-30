import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { FraudCheck, FraudCheckDocument } from './entities/fraud-check.entity';
import { DigitalBehaviorService } from '../digital-behavior/digital-behavior.service';

@Injectable()
export class FraudDetectionService {
  private readonly logger = new Logger(FraudDetectionService.name);

  constructor(
    @InjectModel(FraudCheck.name)
    private fraudCheckModel: Model<FraudCheckDocument>,
    private digitalBehaviorService: DigitalBehaviorService,
  ) {}

  /**
   * Check user for fraud indicators
   */
  async checkUser(
    userId: string,
    userDoc: any,
    ipAddress?: string,
  ): Promise<FraudCheck> {
    const flags: string[] = [];
    let fraudScore = 0;

    // 1. Check behavioral analysis
    const behaviorAnalysis = await this.digitalBehaviorService.analyzeUserBehavior(userId, 30);

    if (behaviorAnalysis.behaviorScore < 50) {
      flags.push('LOW_BEHAVIOR_SCORE');
      fraudScore += 15;
    }

    if (behaviorAnalysis.anomaliesCount > 0) {
      flags.push(`BEHAVIOR_ANOMALIES (${behaviorAnalysis.anomaliesCount})`);
      fraudScore += behaviorAnalysis.anomaliesCount * 5;
    }

    // 2. Check data inconsistencies
    if (userDoc.birthDate) {
      const age = this.calculateAge(userDoc.birthDate);
      if (age < 18 || age > 100) {
        flags.push('INVALID_AGE');
        fraudScore += 20;
      }
    }

    // 3. Check duplicate detection
    const duplicates = await this.checkDuplicates(userDoc);
    if (duplicates.length > 0) {
      flags.push(`DUPLICATE_USERS (${duplicates.length})`);
      fraudScore += duplicates.length * 15;
    }

    // 4. Check document expiration
    if (userDoc.documents) {
      const expiredDocs = this.checkExpiredDocuments(userDoc.documents);
      if (expiredDocs.length > 0) {
        flags.push('EXPIRED_DOCUMENTS');
        fraudScore += 10;
      }
    }

    // 5. Check incomplete profile
    const completeness = this.calculateProfileCompleteness(userDoc);
    if (completeness < 50) {
      flags.push('INCOMPLETE_PROFILE');
      fraudScore += 10;
    }

    // Calculate risk level and recommendation
    const { riskLevel, recommendation } = this.calculateRiskLevel(fraudScore);

    const fraudCheck = new this.fraudCheckModel({
      userId,
      fraudScore: Math.min(100, fraudScore),
      riskLevel,
      checkType: 'USER_VERIFICATION',
      flagsDetected: flags,
      recommendation,
      ipAddress,
      checkDetails: JSON.stringify({
        behaviorAnalysis: {
          score: behaviorAnalysis.behaviorScore,
          anomalies: behaviorAnalysis.anomaliesCount,
        },
        duplicates: duplicates.length,
        profileCompleteness: completeness,
      }),
    });

    const saved = await fraudCheck.save();
    this.logger.log(`Fraud check completed for user ${userId}: Score ${fraudScore}, Risk ${riskLevel}`);

    return saved;
  }

  /**
   * Check credit application for fraud
   */
  async checkCredit(
    creditId: string,
    userId: string,
    creditData: any,
    userDoc: any,
    ipAddress?: string,
  ): Promise<FraudCheck> {
    const flags: string[] = [];
    let fraudScore = 0;

    // 1. Check user first
    const userCheck = await this.checkUser(userId, userDoc, ipAddress);
    fraudScore += userCheck.fraudScore * 0.5; // 50% weight from user check

    // 2. Check multiple credit requests
    const recentCredits = await this.getRecentCreditApplications(userId, 7);
    if (recentCredits > 3) {
      flags.push(`MULTIPLE_REQUESTS (${recentCredits} in 7 days)`);
      fraudScore += 20;
    }

    // 3. Check amount vs income ratio
    if (creditData.amount && userDoc.monthlyIncome) {
      const ratio = creditData.amount / userDoc.monthlyIncome;
      if (ratio > 10) {
        flags.push('EXCESSIVE_AMOUNT_REQUEST');
        fraudScore += 15;
      }
    }

    // 4. Check recent data changes
    const recentChanges = await this.digitalBehaviorService.getUserTimeline(
      userId,
      { eventType: 'DATA_CHANGE', limit: '10' },
    );

    const recentChangeCount = recentChanges.events.filter((e: any) => {
      const hoursSince = (Date.now() - new Date(e.createdAt).getTime()) / (1000 * 60 * 60);
      return hoursSince < 24;
    }).length;

    if (recentChangeCount > 3) {
      flags.push('SUSPICIOUS_DATA_CHANGES');
      fraudScore += 15;
    }

    // 5. Check employment consistency
    if (creditData.dateOfAdmission && userDoc.employmentHistory) {
      const employmentMonths = this.calculateEmploymentMonths(creditData.dateOfAdmission);
      if (employmentMonths < 3) {
        flags.push('SHORT_EMPLOYMENT');
        fraudScore += 10;
      }
    }

    const { riskLevel, recommendation } = this.calculateRiskLevel(fraudScore);

    const fraudCheck = new this.fraudCheckModel({
      userId,
      creditId,
      fraudScore: Math.min(100, fraudScore),
      riskLevel,
      checkType: 'CREDIT_APPLICATION',
      flagsDetected: flags,
      recommendation,
      ipAddress,
      checkDetails: JSON.stringify({
        userCheckScore: userCheck.fraudScore,
        recentCredits,
        dataChanges: recentChangeCount,
      }),
    });

    const saved = await fraudCheck.save();
    this.logger.log(`Fraud check completed for credit ${creditId}: Score ${fraudScore}, Risk ${riskLevel}`);

    return saved;
  }

  /**
   * Get fraud history for user
   */
  async getUserFraudHistory(userId: string): Promise<FraudCheck[]> {
    return this.fraudCheckModel
      .find({ userId })
      .sort({ createdAt: -1 })
      .limit(50)
      .exec();
  }

  /**
   * Get active fraud alerts (high risk)
   */
  async getActiveAlerts(limit: number = 100): Promise<FraudCheck[]> {
    return this.fraudCheckModel
      .find({
        riskLevel: { $in: ['HIGH', 'CRITICAL'] },
        actionTaken: false,
      })
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('userId', 'name lastname email')
      .populate('creditId', 'code amount')
      .exec();
  }

  /**
   * Mark fraud alert as reviewed
   */
  async markAsReviewed(
    fraudCheckId: string,
    reviewedBy: string,
    notes: string,
    action: string,
  ): Promise<FraudCheck> {
    return this.fraudCheckModel.findByIdAndUpdate(
      fraudCheckId,
      {
        actionTaken: true,
        actionDescription: action,
        reviewedBy,
        reviewNotes: notes,
      },
      { new: true },
    );
  }

  // Helper methods

  private calculateAge(birthDate: Date): number {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  }

  private async checkDuplicates(userDoc: any): Promise<any[]> {
    // This would query database for similar users
    // For now, return empty array (implement later with actual User model)
    return [];
  }

  private checkExpiredDocuments(documents: any): any[] {
    const expired = [];
    const now = new Date();

    if (documents && Array.isArray(documents)) {
      for (const doc of documents) {
        if (doc.expiryDate && new Date(doc.expiryDate) < now) {
          expired.push(doc);
        }
      }
    }

    return expired;
  }

  private calculateProfileCompleteness(userDoc: any): number {
    const requiredFields = [
      'name',
      'lastname',
      'email',
      'phone',
      'birthDate',
      'documentNumber',
      'monthlyIncome',
      'address',
    ];

    let completed = 0;
    for (const field of requiredFields) {
      if (userDoc[field]) completed++;
    }

    return (completed / requiredFields.length) * 100;
  }

  private async getRecentCreditApplications(userId: string, days: number): Promise<number> {
    // This would query Credit model - for now return 0
    return 0;
  }

  private calculateEmploymentMonths(dateOfAdmission: Date): number {
    const now = new Date();
    const admission = new Date(dateOfAdmission);
    const diffMonths = (now.getFullYear() - admission.getFullYear()) * 12 +
                       (now.getMonth() - admission.getMonth());
    return diffMonths;
  }

  private calculateRiskLevel(fraudScore: number): {
    riskLevel: string;
    recommendation: string;
  } {
    if (fraudScore <= 30) {
      return { riskLevel: 'LOW', recommendation: 'APPROVE' };
    } else if (fraudScore <= 50) {
      return { riskLevel: 'MEDIUM', recommendation: 'REVIEW' };
    } else if (fraudScore <= 70) {
      return { riskLevel: 'HIGH', recommendation: 'MANUAL_VERIFICATION' };
    } else {
      return { riskLevel: 'CRITICAL', recommendation: 'REJECT' };
    }
  }
}
