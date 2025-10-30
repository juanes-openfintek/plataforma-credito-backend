import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type AuditLogDocument = AuditLog & Document;

/**
 * AuditLog entity for tracking all important actions in the platform
 * Stores information about who did what, when, and on which resource
 */
@Schema({ timestamps: true })
export class AuditLog {
  /**
   * Type of action performed
   * Examples: CREDIT_CREATED, CREDIT_APPROVED, CREDIT_REJECTED, STATUS_CHANGED, etc.
   */
  @Prop({ required: true, index: true })
  action: string;

  /**
   * Resource type being affected
   * Examples: CREDIT, USER, APPROVAL, DISBURSEMENT, etc.
   */
  @Prop({ required: true, index: true })
  resourceType: string;

  /**
   * ID of the resource being affected
   */
  @Prop({ required: true, index: true })
  resourceId: string;

  /**
   * User who performed the action
   */
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId: Types.ObjectId;

  /**
   * Email of the user who performed the action (for quick reference)
   */
  @Prop({ required: true })
  userEmail: string;

  /**
   * Role of the user at the time of action
   */
  @Prop({ required: true })
  userRole: string;

  /**
   * IP address from which the action was performed
   */
  @Prop({ type: String, required: false })
  ipAddress: string;

  /**
   * User agent (browser/device info)
   */
  @Prop({ type: String, required: false })
  userAgent: string;

  /**
   * Description of the action performed
   */
  @Prop({ required: true })
  description: string;

  /**
   * Previous state/value (JSON string)
   * For UPDATE actions, stores the old values
   */
  @Prop({ type: String, required: false })
  previousState: string;

  /**
   * New state/value (JSON string)
   * For CREATE/UPDATE actions, stores the new values
   */
  @Prop({ type: String, required: false })
  newState: string;

  /**
   * Status of the action
   * SUCCESS, FAILED, PENDING
   */
  @Prop({
    required: true,
    enum: ['SUCCESS', 'FAILED', 'PENDING'],
    default: 'SUCCESS',
    index: true
  })
  status: string;

  /**
   * Error message if action failed
   */
  @Prop({ type: String, required: false })
  errorMessage: string;

  /**
   * Additional metadata (JSON string)
   * Can store any extra context needed
   */
  @Prop({ type: String, required: false })
  metadata: string;

  /**
   * Severity level of the action
   * LOW, MEDIUM, HIGH, CRITICAL
   */
  @Prop({
    required: true,
    enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
    default: 'MEDIUM',
    index: true
  })
  severity: string;
}

export const AuditLogSchema = SchemaFactory.createForClass(AuditLog);

// Create compound indexes for efficient queries
AuditLogSchema.index({ userId: 1, createdAt: -1 });
AuditLogSchema.index({ resourceType: 1, resourceId: 1 });
AuditLogSchema.index({ action: 1, createdAt: -1 });
AuditLogSchema.index({ createdAt: -1 });
