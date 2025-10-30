import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  DigitalBehaviorEvent,
  DigitalBehaviorEventDocument,
} from './entities/digital-behavior-event.entity';
import { CreateBehaviorEventDto } from './dto/create-behavior-event.dto';
import { QueryBehaviorDto } from './dto/query-behavior.dto';

@Injectable()
export class DigitalBehaviorService {
  private readonly logger = new Logger(DigitalBehaviorService.name);

  constructor(
    @InjectModel(DigitalBehaviorEvent.name)
    private behaviorEventModel: Model<DigitalBehaviorEventDocument>,
  ) {}

  /**
   * Track a behavior event
   */
  async trackEvent(
    createEventDto: CreateBehaviorEventDto,
  ): Promise<DigitalBehaviorEvent> {
    try {
      // Detect anomalies before saving
      const anomalyCheck = await this.detectAnomalies(createEventDto);

      const event = new this.behaviorEventModel({
        ...createEventDto,
        isAnomaly: anomalyCheck.isAnomaly,
        anomalyReason: anomalyCheck.reason,
        riskLevel: anomalyCheck.riskLevel || createEventDto.riskLevel || 'LOW',
      });

      const savedEvent = await event.save();

      if (anomalyCheck.isAnomaly) {
        this.logger.warn(
          `Anomaly detected for user ${createEventDto.userId}: ${anomalyCheck.reason}`,
        );
      }

      return savedEvent;
    } catch (error) {
      this.logger.error(`Failed to track event: ${error.message}`);
      throw error;
    }
  }

  /**
   * Detect anomalies in user behavior
   */
  private async detectAnomalies(
    eventDto: CreateBehaviorEventDto,
  ): Promise<{
    isAnomaly: boolean;
    reason?: string;
    riskLevel?: string;
  }> {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    // Check 1: Multiple IPs in short time
    const recentIPs = await this.behaviorEventModel.distinct('ipAddress', {
      userId: eventDto.userId,
      createdAt: { $gte: oneHourAgo },
    });

    if (recentIPs.length >= 3 && !recentIPs.includes(eventDto.ipAddress)) {
      return {
        isAnomaly: true,
        reason: `Multiple IPs detected in 1 hour (${recentIPs.length + 1} IPs)`,
        riskLevel: 'HIGH',
      };
    }

    // Check 2: Data changes right after login (suspicious)
    if (eventDto.eventType === 'DATA_CHANGE') {
      const recentLogin = await this.behaviorEventModel.findOne({
        userId: eventDto.userId,
        eventType: 'LOGIN',
        createdAt: { $gte: new Date(now.getTime() - 5 * 60 * 1000) }, // 5 minutes
      });

      if (recentLogin) {
        return {
          isAnomaly: true,
          reason: 'Data changed immediately after login',
          riskLevel: 'MEDIUM',
        };
      }
    }

    // Check 3: Multiple credit requests in short time
    if (eventDto.eventType === 'CREDIT_REQUEST') {
      const recentRequests = await this.behaviorEventModel.countDocuments({
        userId: eventDto.userId,
        eventType: 'CREDIT_REQUEST',
        createdAt: { $gte: oneDayAgo },
      });

      if (recentRequests >= 3) {
        return {
          isAnomaly: true,
          reason: `Multiple credit requests in 24h (${recentRequests + 1} requests)`,
          riskLevel: 'HIGH',
        };
      }
    }

    // Check 4: Abnormal activity speed (potential bot)
    const recentEvents = await this.behaviorEventModel.countDocuments({
      userId: eventDto.userId,
      createdAt: { $gte: new Date(now.getTime() - 1 * 60 * 1000) }, // 1 minute
    });

    if (recentEvents >= 20) {
      return {
        isAnomaly: true,
        reason: `Abnormal activity speed (${recentEvents} events in 1 minute)`,
        riskLevel: 'CRITICAL',
      };
    }

    // Check 5: Sensitive changes (email, phone, bank account)
    if (
      ['EMAIL_CHANGE', 'PHONE_CHANGE', 'BANK_ACCOUNT_CHANGE'].includes(
        eventDto.eventType,
      )
    ) {
      return {
        isAnomaly: false,
        riskLevel: 'HIGH', // Not an anomaly, but high risk
      };
    }

    return { isAnomaly: false };
  }

  /**
   * Get user behavior timeline
   */
  async getUserTimeline(
    userId: string,
    queryDto: QueryBehaviorDto,
  ): Promise<{
    events: DigitalBehaviorEvent[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const page = parseInt(queryDto.page) || 1;
    const limit = parseInt(queryDto.limit) || 50;
    const skip = (page - 1) * limit;

    // Build filters
    const filters: any = { userId };

    if (queryDto.eventType) {
      filters.eventType = queryDto.eventType;
    }

    if (queryDto.riskLevel) {
      filters.riskLevel = queryDto.riskLevel;
    }

    if (queryDto.ipAddress) {
      filters.ipAddress = queryDto.ipAddress;
    }

    // Date range
    if (queryDto.startDate || queryDto.endDate) {
      filters.createdAt = {};
      if (queryDto.startDate) {
        filters.createdAt.$gte = new Date(queryDto.startDate);
      }
      if (queryDto.endDate) {
        filters.createdAt.$lte = new Date(queryDto.endDate);
      }
    }

    const [events, total] = await Promise.all([
      this.behaviorEventModel
        .find(filters)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.behaviorEventModel.countDocuments(filters),
    ]);

    return {
      events,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Analyze user behavior and calculate risk score
   */
  async analyzeUserBehavior(
    userId: string,
    daysBack: number = 30,
  ): Promise<{
    behaviorScore: number;
    riskLevel: string;
    totalEvents: number;
    anomaliesCount: number;
    uniqueIPs: number;
    deviceChanges: number;
    suspiciousPatterns: string[];
    eventBreakdown: any;
  }> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysBack);

    const events = await this.behaviorEventModel.find({
      userId,
      createdAt: { $gte: cutoffDate },
    });

    const anomaliesCount = events.filter((e) => e.isAnomaly).length;
    const uniqueIPs = [...new Set(events.map((e) => e.ipAddress))].length;
    const uniqueDevices = [...new Set(events.map((e) => e.deviceInfo))].length;

    // Calculate behavior score (0-100)
    let score = 100;

    // Penalties
    score -= anomaliesCount * 10; // -10 points per anomaly
    if (uniqueIPs > 5) score -= (uniqueIPs - 5) * 5; // -5 points per extra IP
    if (uniqueDevices > 3) score -= (uniqueDevices - 3) * 3; // -3 points per extra device

    const highRiskEvents = events.filter((e) => e.riskLevel === 'HIGH').length;
    const criticalEvents = events.filter(
      (e) => e.riskLevel === 'CRITICAL',
    ).length;

    score -= highRiskEvents * 5;
    score -= criticalEvents * 15;

    score = Math.max(0, Math.min(100, score)); // Clamp between 0-100

    // Determine risk level based on score
    let riskLevel: string;
    if (score >= 70) riskLevel = 'LOW';
    else if (score >= 40) riskLevel = 'MEDIUM';
    else if (score >= 20) riskLevel = 'HIGH';
    else riskLevel = 'CRITICAL';

    // Identify suspicious patterns
    const suspiciousPatterns: string[] = [];

    if (anomaliesCount > 0) {
      suspiciousPatterns.push(`${anomaliesCount} anomalías detectadas`);
    }
    if (uniqueIPs > 5) {
      suspiciousPatterns.push(`Múltiples IPs (${uniqueIPs})`);
    }
    if (uniqueDevices > 3) {
      suspiciousPatterns.push(`Múltiples dispositivos (${uniqueDevices})`);
    }
    if (criticalEvents > 0) {
      suspiciousPatterns.push(`${criticalEvents} eventos críticos`);
    }

    // Event breakdown
    const eventBreakdown = events.reduce((acc, event) => {
      acc[event.eventType] = (acc[event.eventType] || 0) + 1;
      return acc;
    }, {});

    return {
      behaviorScore: score,
      riskLevel,
      totalEvents: events.length,
      anomaliesCount,
      uniqueIPs,
      deviceChanges: uniqueDevices - 1,
      suspiciousPatterns,
      eventBreakdown,
    };
  }

  /**
   * Get anomalies for a user
   */
  async getUserAnomalies(userId: string, limit: number = 50): Promise<DigitalBehaviorEvent[]> {
    return this.behaviorEventModel
      .find({ userId, isAnomaly: true })
      .sort({ createdAt: -1 })
      .limit(limit)
      .exec();
  }

  /**
   * Get all high-risk events across all users (admin)
   */
  async getHighRiskEvents(limit: number = 100): Promise<DigitalBehaviorEvent[]> {
    return this.behaviorEventModel
      .find({
        $or: [
          { riskLevel: 'HIGH' },
          { riskLevel: 'CRITICAL' },
          { isAnomaly: true },
        ],
      })
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('userId', 'name lastname email')
      .exec();
  }
}
