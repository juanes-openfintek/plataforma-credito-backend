import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type FraudCheckDocument = FraudCheck & Document;

/**
 * FraudCheck entity for storing fraud analysis results
 */
@Schema({ timestamps: true })
export class FraudCheck {
  /**
   * User being checked
   */
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId: Types.ObjectId;

  /**
   * Credit being checked (if applicable)
   */
  @Prop({ type: Types.ObjectId, ref: 'Credit', required: false, index: true })
  creditId: Types.ObjectId;

  /**
   * Fraud score (0-100)
   * 0-30: Low risk, 31-70: Medium risk, 71-100: High risk
   */
  @Prop({ required: true, index: true })
  fraudScore: number;

  /**
   * Risk level
   */
  @Prop({
    required: true,
    enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
    index: true,
  })
  riskLevel: string;

  /**
   * Check type
   */
  @Prop({
    required: true,
    enum: ['USER_VERIFICATION', 'CREDIT_APPLICATION', 'MANUAL_CHECK'],
  })
  checkType: string;

  /**
   * Flags detected
   */
  @Prop({ type: [String], default: [] })
  flagsDetected: string[];

  /**
   * Details of each check performed (JSON string)
   */
  @Prop({ type: String, required: false })
  checkDetails: string;

  /**
   * Recommendation
   */
  @Prop({
    required: true,
    enum: ['APPROVE', 'REVIEW', 'REJECT', 'MANUAL_VERIFICATION'],
  })
  recommendation: string;

  /**
   * Whether action was taken
   */
  @Prop({ type: Boolean, default: false })
  actionTaken: boolean;

  /**
   * Action taken description
   */
  @Prop({ type: String, required: false })
  actionDescription: string;

  /**
   * Reviewed by admin
   */
  @Prop({ type: Types.ObjectId, ref: 'User', required: false })
  reviewedBy: Types.ObjectId;

  /**
   * Review notes
   */
  @Prop({ type: String, required: false })
  reviewNotes: string;

  /**
   * IP address at time of check
   */
  @Prop({ type: String, required: false })
  ipAddress: string;
}

export const FraudCheckSchema = SchemaFactory.createForClass(FraudCheck);

// Indexes
FraudCheckSchema.index({ userId: 1, createdAt: -1 });
FraudCheckSchema.index({ fraudScore: -1 });
FraudCheckSchema.index({ riskLevel: 1, createdAt: -1 });
