import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Notification, NotificationDocument } from './entities/notification.entity';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { QueryNotificationsDto } from './dto/query-notifications.dto';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    @InjectModel(Notification.name)
    private notificationModel: Model<NotificationDocument>,
  ) {}

  /**
   * Create a new notification
   */
  async create(createNotificationDto: CreateNotificationDto): Promise<Notification> {
    try {
      const notification = new this.notificationModel({
        ...createNotificationDto,
        priority: createNotificationDto.priority || 'NORMAL',
        category: createNotificationDto.category || 'SYSTEM',
        icon: createNotificationDto.icon || '🔔',
        isRead: false,
        isDismissed: false,
      });

      const savedNotification = await notification.save();
      this.logger.log(`Notification created for user ${createNotificationDto.userId}: ${createNotificationDto.title}`);

      return savedNotification;
    } catch (error) {
      this.logger.error(`Failed to create notification: ${error.message}`);
      throw error;
    }
  }

  /**
   * Create notification for credit approval
   */
  async notifyCreditApproved(
    userId: string,
    creditId: string,
    creditAmount: number,
    radicationNumber: string,
  ): Promise<Notification> {
    return this.create({
      userId,
      type: 'CREDIT_APPROVED',
      title: '✅ Crédito Aprobado',
      message: `Tu crédito por $${creditAmount.toLocaleString('es-CO')} ha sido aprobado. Número de radicación: ${radicationNumber}`,
      priority: 'HIGH',
      category: 'CREDIT',
      resourceType: 'CREDIT',
      resourceId: creditId,
      actionUrl: `/usuario/creditos/${creditId}`,
      actionText: 'Ver Detalles',
      icon: '✅',
    });
  }

  /**
   * Create notification for credit rejection
   */
  async notifyCreditRejected(
    userId: string,
    creditId: string,
    reason: string,
    radicationNumber: string,
  ): Promise<Notification> {
    return this.create({
      userId,
      type: 'CREDIT_REJECTED',
      title: '❌ Crédito Rechazado',
      message: `Tu crédito ${radicationNumber} ha sido rechazado. Motivo: ${reason}`,
      priority: 'HIGH',
      category: 'CREDIT',
      resourceType: 'CREDIT',
      resourceId: creditId,
      actionUrl: `/usuario/creditos/${creditId}`,
      actionText: 'Ver Detalles',
      icon: '❌',
    });
  }

  /**
   * Create notification for credit disbursement
   */
  async notifyCreditDisbursed(
    userId: string,
    creditId: string,
    amount: number,
    radicationNumber: string,
  ): Promise<Notification> {
    return this.create({
      userId,
      type: 'CREDIT_DISBURSED',
      title: '💰 Crédito Desembolsado',
      message: `El desembolso de $${amount.toLocaleString('es-CO')} del crédito ${radicationNumber} ha sido procesado exitosamente`,
      priority: 'HIGH',
      category: 'CREDIT',
      resourceType: 'CREDIT',
      resourceId: creditId,
      actionUrl: `/usuario/creditos/${creditId}`,
      actionText: 'Ver Detalles',
      icon: '💰',
    });
  }

  /**
   * Create notification for payment due
   */
  async notifyPaymentDue(
    userId: string,
    creditId: string,
    amount: number,
    dueDate: Date,
  ): Promise<Notification> {
    const daysUntilDue = Math.ceil((dueDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));

    return this.create({
      userId,
      type: 'PAYMENT_DUE',
      title: '📅 Pago Próximo a Vencer',
      message: `Tienes un pago de $${amount.toLocaleString('es-CO')} que vence en ${daysUntilDue} día(s)`,
      priority: daysUntilDue <= 3 ? 'URGENT' : 'HIGH',
      category: 'PAYMENT',
      resourceType: 'CREDIT',
      resourceId: creditId,
      actionUrl: `/usuario/pagos`,
      actionText: 'Pagar Ahora',
      icon: '📅',
      expiresAt: dueDate.toISOString(),
    });
  }

  /**
   * Get user notifications with filters and pagination
   */
  async getUserNotifications(
    userId: string,
    queryDto: QueryNotificationsDto,
  ): Promise<{
    notifications: Notification[];
    total: number;
    unreadCount: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const page = parseInt(queryDto.page) || 1;
    const limit = parseInt(queryDto.limit) || 20;
    const skip = (page - 1) * limit;

    // Build query filters
    const filters: any = { userId };

    if (queryDto.category) {
      filters.category = queryDto.category;
    }

    if (queryDto.priority) {
      filters.priority = queryDto.priority;
    }

    if (queryDto.isRead !== undefined) {
      filters.isRead = queryDto.isRead;
    }

    // Don't show expired or dismissed notifications
    filters.isDismissed = false;
    filters.$or = [
      { expiresAt: { $exists: false } },
      { expiresAt: { $gte: new Date() } },
    ];

    // Execute queries
    const [notifications, total, unreadCount] = await Promise.all([
      this.notificationModel
        .find(filters)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.notificationModel.countDocuments(filters),
      this.notificationModel.countDocuments({ userId, isRead: false, isDismissed: false }),
    ]);

    return {
      notifications,
      total,
      unreadCount,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId: string, userId: string): Promise<Notification> {
    const notification = await this.notificationModel.findOne({
      _id: notificationId,
      userId,
    });

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    notification.isRead = true;
    notification.readAt = new Date();
    await notification.save();

    return notification;
  }

  /**
   * Mark all notifications as read for a user
   */
  async markAllAsRead(userId: string): Promise<{ modifiedCount: number }> {
    const result = await this.notificationModel.updateMany(
      { userId, isRead: false },
      { $set: { isRead: true, readAt: new Date() } },
    );

    this.logger.log(`Marked ${result.modifiedCount} notifications as read for user ${userId}`);

    return { modifiedCount: result.modifiedCount };
  }

  /**
   * Dismiss notification
   */
  async dismiss(notificationId: string, userId: string): Promise<Notification> {
    const notification = await this.notificationModel.findOne({
      _id: notificationId,
      userId,
    });

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    notification.isDismissed = true;
    await notification.save();

    return notification;
  }

  /**
   * Get unread count for user
   */
  async getUnreadCount(userId: string): Promise<number> {
    return this.notificationModel.countDocuments({
      userId,
      isRead: false,
      isDismissed: false,
    });
  }

  /**
   * Delete old notifications (cleanup job)
   */
  async deleteOldNotifications(daysOld: number = 90): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const result = await this.notificationModel.deleteMany({
      createdAt: { $lt: cutoffDate },
      isRead: true,
    });

    this.logger.log(`Deleted ${result.deletedCount} old notifications`);
    return result.deletedCount;
  }
}
