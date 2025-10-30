import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Param,
  UseGuards,
} from '@nestjs/common';
import { AuditService } from './audit.service';
import { CreateAuditLogDto } from './dto/create-audit-log.dto';
import { QueryAuditLogDto } from './dto/query-audit-log.dto';

/**
 * AuditController handles all audit log related endpoints
 * Requires authentication for all endpoints
 */
@Controller('audit')
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  /**
   * Create a new audit log entry
   * POST /audit
   */
  @Post()
  async createLog(@Body() createAuditLogDto: CreateAuditLogDto) {
    return this.auditService.createLog(createAuditLogDto);
  }

  /**
   * Query audit logs with filters and pagination
   * GET /audit
   * Query params: action, resourceType, resourceId, userId, userEmail, status, severity, startDate, endDate, page, limit
   */
  @Get()
  async queryLogs(@Query() queryDto: QueryAuditLogDto) {
    return this.auditService.queryLogs(queryDto);
  }

  /**
   * Get audit logs for a specific resource
   * GET /audit/resource/:resourceType/:resourceId
   */
  @Get('resource/:resourceType/:resourceId')
  async getResourceHistory(
    @Param('resourceType') resourceType: string,
    @Param('resourceId') resourceId: string,
  ) {
    return this.auditService.getResourceHistory(resourceType, resourceId);
  }

  /**
   * Get audit logs for a specific user
   * GET /audit/user/:userId
   * Query param: limit (default 100)
   */
  @Get('user/:userId')
  async getUserActivity(
    @Param('userId') userId: string,
    @Query('limit') limit?: string,
  ) {
    const limitNum = limit ? parseInt(limit) : 100;
    return this.auditService.getUserActivity(userId, limitNum);
  }

  /**
   * Get recent critical activities
   * GET /audit/critical
   * Query param: limit (default 50)
   */
  @Get('critical')
  async getCriticalActivities(@Query('limit') limit?: string) {
    const limitNum = limit ? parseInt(limit) : 50;
    return this.auditService.getCriticalActivities(limitNum);
  }

  /**
   * Get audit statistics
   * GET /audit/statistics
   * Query params: startDate, endDate
   */
  @Get('statistics')
  async getStatistics(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;
    return this.auditService.getStatistics(start, end);
  }
}
