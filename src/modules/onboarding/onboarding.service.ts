import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  OnboardingSession,
  OnboardingSessionDocument,
} from './entities/onboarding-session.entity';
import { BiometrySimulator } from './utils/biometry-simulator';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class OnboardingService {
  private readonly logger = new Logger(OnboardingService.name);

  constructor(
    @InjectModel(OnboardingSession.name)
    private onboardingSessionModel: Model<OnboardingSessionDocument>,
  ) {}

  /**
   * Start new onboarding session
   */
  async startSession(
    userId: string,
    ipAddress?: string,
    deviceInfo?: string,
  ): Promise<OnboardingSession> {
    const sessionId = `ONB-${uuidv4()}`;

    const session = new this.onboardingSessionModel({
      userId,
      sessionId,
      stage: 1,
      completionPercentage: 0,
      status: 'IN_PROGRESS',
      ipAddress,
      deviceInfo,
    });

    const saved = await session.save();
    this.logger.log(`Onboarding session started: ${sessionId} for user ${userId}`);

    return saved;
  }

  /**
   * Get session status
   */
  async getSession(sessionId: string): Promise<OnboardingSession> {
    const session = await this.onboardingSessionModel
      .findOne({ sessionId })
      .populate('userId', 'name lastname email')
      .exec();

    if (!session) {
      throw new NotFoundException(`Session ${sessionId} not found`);
    }

    return session;
  }

  /**
   * Update stage and completion
   */
  async updateStage(
    sessionId: string,
    stage: number,
  ): Promise<OnboardingSession> {
    const completionPercentage = Math.floor((stage / 6) * 100);

    const session = await this.onboardingSessionModel.findOneAndUpdate(
      { sessionId },
      { stage, completionPercentage },
      { new: true },
    );

    if (!session) {
      throw new NotFoundException(`Session ${sessionId} not found`);
    }

    this.logger.log(`Session ${sessionId} updated to stage ${stage}`);
    return session;
  }

  /**
   * Upload document
   */
  async uploadDocument(
    sessionId: string,
    documentType: 'dni' | 'selfie' | 'proof',
    fileUrl: string,
  ): Promise<OnboardingSession> {
    const session = await this.onboardingSessionModel.findOne({ sessionId });

    if (!session) {
      throw new NotFoundException(`Session ${sessionId} not found`);
    }

    // Simulate document verification
    const verification = BiometrySimulator.simulateDocumentVerification(
      documentType === 'dni' ? 'DNI' : 'PROOF',
    );

    if (!session.documents) {
      session.documents = {
        dni: { uploaded: false, verified: false },
        selfie: { uploaded: false, verified: false },
        proof: { uploaded: false, verified: false },
      };
    }

    session.documents[documentType] = {
      uploaded: true,
      verified: verification.verified,
      url: fileUrl,
      uploadedAt: new Date(),
    };

    await session.save();

    this.logger.log(
      `Document ${documentType} uploaded for session ${sessionId}: ${verification.verified ? 'verified' : 'pending'}`,
    );

    return session;
  }

  /**
   * Perform biometry verification
   */
  async verifyBiometry(sessionId: string): Promise<OnboardingSession> {
    const session = await this.onboardingSessionModel.findOne({ sessionId });

    if (!session) {
      throw new NotFoundException(`Session ${sessionId} not found`);
    }

    // Simulate full biometric verification
    const verification = BiometrySimulator.simulateFullVerification();

    session.biometry = {
      faceMatchScore: verification.faceMatchScore,
      livenessCheck: {
        passed: verification.livenessCheck.passed,
        confidence: verification.livenessCheck.confidence,
      },
      biometryStatus: verification.recommendation,
      timestamp: new Date(),
    };

    await session.save();

    this.logger.log(
      `Biometry verified for session ${sessionId}: ${verification.recommendation}`,
    );

    return session;
  }

  /**
   * Complete employment info
   */
  async completeEmployment(
    sessionId: string,
    employmentData: any,
  ): Promise<OnboardingSession> {
    const session = await this.onboardingSessionModel.findOneAndUpdate(
      { sessionId },
      {
        employmentCompleted: true,
        metadata: JSON.stringify({ employment: employmentData }),
      },
      { new: true },
    );

    if (!session) {
      throw new NotFoundException(`Session ${sessionId} not found`);
    }

    this.logger.log(`Employment completed for session ${sessionId}`);
    return session;
  }

  /**
   * Complete banking info
   */
  async completeBanking(
    sessionId: string,
    bankingData: any,
  ): Promise<OnboardingSession> {
    const session = await this.onboardingSessionModel.findOne({ sessionId });

    if (!session) {
      throw new NotFoundException(`Session ${sessionId} not found`);
    }

    session.bankingCompleted = true;

    // Update metadata with banking info
    const currentMetadata = session.metadata
      ? JSON.parse(session.metadata)
      : {};
    session.metadata = JSON.stringify({
      ...currentMetadata,
      banking: bankingData,
    });

    await session.save();

    this.logger.log(`Banking completed for session ${sessionId}`);
    return session;
  }

  /**
   * Complete onboarding session
   */
  async completeSession(sessionId: string): Promise<OnboardingSession> {
    const session = await this.onboardingSessionModel.findOne({ sessionId });

    if (!session) {
      throw new NotFoundException(`Session ${sessionId} not found`);
    }

    // Validate all steps completed
    const allDocsUploaded =
      session.documents?.dni?.uploaded &&
      session.documents?.selfie?.uploaded &&
      session.documents?.proof?.uploaded;

    const biometryApproved =
      session.biometry?.biometryStatus === 'APPROVED';

    if (
      !allDocsUploaded ||
      !biometryApproved ||
      !session.employmentCompleted ||
      !session.bankingCompleted
    ) {
      session.status = 'FAILED';
      session.failureReason = 'Incomplete onboarding steps';
      await session.save();
      throw new Error('Cannot complete: missing required steps');
    }

    session.status = 'COMPLETED';
    session.stage = 6;
    session.completionPercentage = 100;
    session.completedAt = new Date();

    await session.save();

    this.logger.log(`Onboarding completed for session ${sessionId}`);
    return session;
  }

  /**
   * Get user's onboarding history
   */
  async getUserSessions(userId: string): Promise<OnboardingSession[]> {
    return this.onboardingSessionModel
      .find({ userId })
      .sort({ createdAt: -1 })
      .limit(10)
      .exec();
  }

  /**
   * Get incomplete sessions (for cleanup/reminders)
   */
  async getIncompleteSessions(
    daysOld: number = 7,
  ): Promise<OnboardingSession[]> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    return this.onboardingSessionModel
      .find({
        status: 'IN_PROGRESS',
        createdAt: { $lt: cutoffDate },
      })
      .populate('userId', 'name lastname email')
      .exec();
  }

  /**
   * Abandon session
   */
  async abandonSession(sessionId: string): Promise<OnboardingSession> {
    const session = await this.onboardingSessionModel.findOneAndUpdate(
      { sessionId },
      { status: 'ABANDONED' },
      { new: true },
    );

    if (!session) {
      throw new NotFoundException(`Session ${sessionId} not found`);
    }

    this.logger.log(`Session ${sessionId} abandoned`);
    return session;
  }
}
