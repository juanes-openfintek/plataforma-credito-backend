import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AuditLog, AuditLogDocument } from './entities/audit-log.entity';
import { CreateAuditLogDto } from './dto/create-audit-log.dto';
import { QueryAuditLogDto } from './dto/query-audit-log.dto';

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(
    @InjectModel(AuditLog.name)
    private auditLogModel: Model<AuditLogDocument>,
  ) {}

  /**
   * Create an audit log entry
   */
  async createLog(createAuditLogDto: CreateAuditLogDto): Promise<AuditLog> {
    try {
      const auditLog = new this.auditLogModel({
        ...createAuditLogDto,
        status: createAuditLogDto.status || 'SUCCESS',
        severity: createAuditLogDto.severity || 'MEDIUM',
      });

      const savedLog = await auditLog.save();
      this.logger.log(`Audit log created: ${createAuditLogDto.action} by ${createAuditLogDto.userEmail}`);

      return savedLog;
    } catch (error) {
      this.logger.error(`Failed to create audit log: ${error.message}`);
      throw error;
    }
  }

  /**
   * Quick method to log credit actions
   */
  async logCreditAction(
    action: string,
    creditId: string,
    userId: string,
    userEmail: string,
    userRole: string,
    description: string,
    options?: {
      previousState?: any;
      newState?: any;
      severity?: string;
      ipAddress?: string;
      userAgent?: string;
      metadata?: any;
    }
  ): Promise<AuditLog> {
    return this.createLog({
      action,
      resourceType: 'CREDIT',
      resourceId: creditId,
      userId,
      userEmail,
      userRole,
      description,
      previousState: options?.previousState ? JSON.stringify(options.previousState) : undefined,
      newState: options?.newState ? JSON.stringify(options.newState) : undefined,
      severity: options?.severity || 'MEDIUM',
      ipAddress: options?.ipAddress,
      userAgent: options?.userAgent,
      metadata: options?.metadata ? JSON.stringify(options.metadata) : undefined,
      status: 'SUCCESS',
    });
  }

  /**
   * Quick method to log user actions
   */
  async logUserAction(
    action: string,
    targetUserId: string,
    performedByUserId: string,
    performedByEmail: string,
    performedByRole: string,
    description: string,
    options?: {
      previousState?: any;
      newState?: any;
      severity?: string;
      ipAddress?: string;
      userAgent?: string;
    }
  ): Promise<AuditLog> {
    return this.createLog({
      action,
      resourceType: 'USER',
      resourceId: targetUserId,
      userId: performedByUserId,
      userEmail: performedByEmail,
      userRole: performedByRole,
      description,
      previousState: options?.previousState ? JSON.stringify(options.previousState) : undefined,
      newState: options?.newState ? JSON.stringify(options.newState) : undefined,
      severity: options?.severity || 'LOW',
      ipAddress: options?.ipAddress,
      userAgent: options?.userAgent,
      status: 'SUCCESS',
    });
  }

  /**
   * Query audit logs with filters and pagination
   */
  async queryLogs(queryDto: QueryAuditLogDto): Promise<{
    logs: AuditLog[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const page = parseInt(queryDto.page) || 1;
    const limit = parseInt(queryDto.limit) || 50;
    const skip = (page - 1) * limit;

    // Build query filters
    const filters: any = {};

    if (queryDto.action) {
      filters.action = queryDto.action;
    }

    if (queryDto.resourceType) {
      filters.resourceType = queryDto.resourceType;
    }

    if (queryDto.resourceId) {
      filters.resourceId = queryDto.resourceId;
    }

    if (queryDto.userId) {
      filters.userId = queryDto.userId;
    }

    if (queryDto.userEmail) {
      filters.userEmail = { $regex: queryDto.userEmail, $options: 'i' };
    }

    if (queryDto.status) {
      filters.status = queryDto.status;
    }

    if (queryDto.severity) {
      filters.severity = queryDto.severity;
    }

    // Date range filter
    if (queryDto.startDate || queryDto.endDate) {
      filters.createdAt = {};
      if (queryDto.startDate) {
        filters.createdAt.$gte = new Date(queryDto.startDate);
      }
      if (queryDto.endDate) {
        filters.createdAt.$lte = new Date(queryDto.endDate);
      }
    }

    // Execute query
    const [logs, total] = await Promise.all([
      this.auditLogModel
        .find(filters)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('userId', 'name lastname email')
        .exec(),
      this.auditLogModel.countDocuments(filters),
    ]);

    return {
      logs,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Get audit logs for a specific resource
   */
  async getResourceHistory(
    resourceType: string,
    resourceId: string,
  ): Promise<AuditLog[]> {
    return this.auditLogModel
      .find({ resourceType, resourceId })
      .sort({ createdAt: -1 })
      .populate('userId', 'name lastname email')
      .exec();
  }

  /**
   * Get audit logs for a specific user
   */
  async getUserActivity(
    userId: string,
    limit: number = 100,
  ): Promise<AuditLog[]> {
    return this.auditLogModel
      .find({ userId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .exec();
  }

  /**
   * Get recent critical activities
   */
  async getCriticalActivities(limit: number = 50): Promise<AuditLog[]> {
    return this.auditLogModel
      .find({ severity: 'CRITICAL' })
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('userId', 'name lastname email')
      .exec();
  }

  /**
   * Get audit statistics
   */
  async getStatistics(startDate?: Date, endDate?: Date): Promise<any> {
    const dateFilter: any = {};
    if (startDate || endDate) {
      dateFilter.createdAt = {};
      if (startDate) dateFilter.createdAt.$gte = startDate;
      if (endDate) dateFilter.createdAt.$lte = endDate;
    }

    const [
      totalLogs,
      actionStats,
      severityStats,
      statusStats,
      resourceTypeStats,
    ] = await Promise.all([
      this.auditLogModel.countDocuments(dateFilter),
      this.auditLogModel.aggregate([
        { $match: dateFilter },
        { $group: { _id: '$action', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ]),
      this.auditLogModel.aggregate([
        { $match: dateFilter },
        { $group: { _id: '$severity', count: { $sum: 1 } } },
      ]),
      this.auditLogModel.aggregate([
        { $match: dateFilter },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
      this.auditLogModel.aggregate([
        { $match: dateFilter },
        { $group: { _id: '$resourceType', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
    ]);

    return {
      totalLogs,
      topActions: actionStats,
      bySeverity: severityStats,
      byStatus: statusStats,
      byResourceType: resourceTypeStats,
    };
  }
}
