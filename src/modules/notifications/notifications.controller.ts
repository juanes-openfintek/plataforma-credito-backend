import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  Patch,
  Delete,
} from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { QueryNotificationsDto } from './dto/query-notifications.dto';
import { Auth, GetUser } from '../auth/decorators';
import { User } from '../auth/entities/user.entity';

/**
 * NotificationsController handles all notification-related endpoints
 * All endpoints require authentication
 */
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  /**
   * Create a new notification
   * POST /notifications
   * Admin only - for manual notification creation
   */
  @Post()
  @Auth()
  async create(@Body() createNotificationDto: CreateNotificationDto) {
    return this.notificationsService.create(createNotificationDto);
  }

  /**
   * Get current user's notifications
   * GET /notifications
   * Query params: category, priority, isRead, page, limit
   */
  @Get()
  @Auth()
  async getUserNotifications(
    @GetUser() user: User,
    @Query() queryDto: QueryNotificationsDto,
  ) {
    return this.notificationsService.getUserNotifications(user.id, queryDto);
  }

  /**
   * Get unread notification count
   * GET /notifications/unread-count
   */
  @Get('unread-count')
  @Auth()
  async getUnreadCount(@GetUser() user: User) {
    const count = await this.notificationsService.getUnreadCount(user.id);
    return { unreadCount: count };
  }

  /**
   * Mark notification as read
   * PATCH /notifications/:id/read
   */
  @Patch(':id/read')
  @Auth()
  async markAsRead(@Param('id') id: string, @GetUser() user: User) {
    return this.notificationsService.markAsRead(id, user.id);
  }

  /**
   * Mark all notifications as read
   * PATCH /notifications/read-all
   */
  @Patch('read-all')
  @Auth()
  async markAllAsRead(@GetUser() user: User) {
    return this.notificationsService.markAllAsRead(user.id);
  }

  /**
   * Dismiss notification
   * DELETE /notifications/:id
   */
  @Delete(':id')
  @Auth()
  async dismiss(@Param('id') id: string, @GetUser() user: User) {
    return this.notificationsService.dismiss(id, user.id);
  }
}
