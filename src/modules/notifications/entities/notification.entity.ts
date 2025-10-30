import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type NotificationDocument = Notification & Document;

/**
 * Notification entity for user alerts and messages
 * Stores information about system events that users need to be aware of
 */
@Schema({ timestamps: true })
export class Notification {
  /**
   * User who will receive this notification
   */
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId: Types.ObjectId;

  /**
   * Type of notification
   * Examples: CREDIT_APPROVED, CREDIT_REJECTED, CREDIT_DISBURSED, PAYMENT_DUE, etc.
   */
  @Prop({ required: true, index: true })
  type: string;

  /**
   * Title of the notification
   */
  @Prop({ required: true })
  title: string;

  /**
   * Notification message/body
   */
  @Prop({ required: true })
  message: string;

  /**
   * Priority level
   * LOW, NORMAL, HIGH, URGENT
   */
  @Prop({
    required: true,
    enum: ['LOW', 'NORMAL', 'HIGH', 'URGENT'],
    default: 'NORMAL',
    index: true
  })
  priority: string;

  /**
   * Related resource type (if applicable)
   */
  @Prop({ type: String, required: false })
  resourceType: string;

  /**
   * Related resource ID (if applicable)
   */
  @Prop({ type: String, required: false })
  resourceId: string;

  /**
   * Action URL (where to redirect when clicked)
   */
  @Prop({ type: String, required: false })
  actionUrl: string;

  /**
   * Action button text
   */
  @Prop({ type: String, required: false })
  actionText: string;

  /**
   * Whether the notification has been read
   */
  @Prop({ required: true, default: false, index: true })
  isRead: boolean;

  /**
   * When the notification was read
   */
  @Prop({ type: Date, required: false })
  readAt: Date;

  /**
   * Whether the notification has been dismissed
   */
  @Prop({ required: true, default: false })
  isDismissed: boolean;

  /**
   * Additional metadata (JSON string)
   */
  @Prop({ type: String, required: false })
  metadata: string;

  /**
   * Icon or emoji to display
   */
  @Prop({ type: String, required: false, default: '🔔' })
  icon: string;

  /**
   * Category for grouping notifications
   */
  @Prop({
    type: String,
    required: true,
    enum: ['CREDIT', 'PAYMENT', 'SYSTEM', 'ACCOUNT', 'SECURITY'],
    default: 'SYSTEM',
    index: true
  })
  category: string;

  /**
   * Expiration date (optional, for time-sensitive notifications)
   */
  @Prop({ type: Date, required: false })
  expiresAt: Date;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);

// Create compound indexes for efficient queries
NotificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });
NotificationSchema.index({ userId: 1, category: 1, createdAt: -1 });
NotificationSchema.index({ userId: 1, priority: 1, isRead: 1 });
