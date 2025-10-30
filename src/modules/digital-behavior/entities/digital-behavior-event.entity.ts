import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type DigitalBehaviorEventDocument = DigitalBehaviorEvent & Document;

/**
 * DigitalBehaviorEvent entity for tracking user digital behavior
 * Records every significant action to detect patterns and anomalies
 */
@Schema({ timestamps: true })
export class DigitalBehaviorEvent {
  /**
   * User who performed the action
   */
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId: Types.ObjectId;

  /**
   * Type of event
   */
  @Prop({
    required: true,
    enum: [
      'LOGIN',
      'LOGOUT',
      'DATA_CHANGE',
      'UPLOAD',
      'CREDIT_REQUEST',
      'CREDIT_VIEW',
      'DOCUMENT_DOWNLOAD',
      'PROFILE_UPDATE',
      'PASSWORD_CHANGE',
      'EMAIL_CHANGE',
      'PHONE_CHANGE',
      'BANK_ACCOUNT_CHANGE',
    ],
    index: true,
  })
  eventType: string;

  /**
   * IP address from which the action was performed
   */
  @Prop({ required: true, index: true })
  ipAddress: string;

  /**
   * Device information (user agent)
   */
  @Prop({ required: true })
  deviceInfo: string;

  /**
   * Browser information
   */
  @Prop({ type: String, required: false })
  browser: string;

  /**
   * Operating system
   */
  @Prop({ type: String, required: false })
  operatingSystem: string;

  /**
   * Device type (desktop, mobile, tablet)
   */
  @Prop({ type: String, required: false })
  deviceType: string;

  /**
   * Geographic location (optional)
   */
  @Prop({ type: String, required: false })
  location: string;

  /**
   * Risk level of this event
   */
  @Prop({
    required: true,
    enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
    default: 'LOW',
    index: true,
  })
  riskLevel: string;

  /**
   * Reason for risk level (if elevated)
   */
  @Prop({ type: String, required: false })
  riskReason: string;

  /**
   * Additional details about the event (JSON string)
   */
  @Prop({ type: String, required: false })
  details: string;

  /**
   * Data changed (for DATA_CHANGE events)
   */
  @Prop({ type: String, required: false })
  dataChanged: string;

  /**
   * Previous value (for DATA_CHANGE events)
   */
  @Prop({ type: String, required: false })
  previousValue: string;

  /**
   * New value (for DATA_CHANGE events)
   */
  @Prop({ type: String, required: false })
  newValue: string;

  /**
   * Session ID (to group events)
   */
  @Prop({ type: String, required: false, index: true })
  sessionId: string;

  /**
   * Time spent on page/action (in seconds)
   */
  @Prop({ type: Number, required: false })
  timeSpent: number;

  /**
   * Request URL
   */
  @Prop({ type: String, required: false })
  requestUrl: string;

  /**
   * HTTP method
   */
  @Prop({ type: String, required: false })
  httpMethod: string;

  /**
   * Whether this event triggered an anomaly alert
   */
  @Prop({ type: Boolean, default: false, index: true })
  isAnomaly: boolean;

  /**
   * Anomaly reason (if applicable)
   */
  @Prop({ type: String, required: false })
  anomalyReason: string;
}

export const DigitalBehaviorEventSchema = SchemaFactory.createForClass(DigitalBehaviorEvent);

// Create compound indexes for efficient queries
DigitalBehaviorEventSchema.index({ userId: 1, createdAt: -1 });
DigitalBehaviorEventSchema.index({ userId: 1, eventType: 1 });
DigitalBehaviorEventSchema.index({ ipAddress: 1, createdAt: -1 });
DigitalBehaviorEventSchema.index({ riskLevel: 1, createdAt: -1 });
DigitalBehaviorEventSchema.index({ isAnomaly: 1, createdAt: -1 });
