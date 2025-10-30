import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type OnboardingSessionDocument = OnboardingSession & Document;

/**
 * OnboardingSession entity for tracking user onboarding process
 */
@Schema({ timestamps: true })
export class OnboardingSession {
  /**
   * User performing onboarding
   */
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId: Types.ObjectId;

  /**
   * Unique session ID
   */
  @Prop({ required: true, unique: true, index: true })
  sessionId: string;

  /**
   * Current stage (1-6)
   * 1: Basic data, 2: Documents, 3: Biometry, 4: Employment, 5: Banking, 6: Confirmation
   */
  @Prop({ required: true, min: 1, max: 6, default: 1 })
  stage: number;

  /**
   * Completion percentage
   */
  @Prop({ required: true, min: 0, max: 100, default: 0 })
  completionPercentage: number;

  /**
   * Status of onboarding
   */
  @Prop({
    required: true,
    enum: ['IN_PROGRESS', 'COMPLETED', 'ABANDONED', 'FAILED'],
    default: 'IN_PROGRESS',
    index: true,
  })
  status: string;

  /**
   * Biometry verification data
   */
  @Prop({
    type: {
      faceMatchScore: { type: Number, min: 0, max: 100 },
      livenessCheck: {
        passed: { type: Boolean },
        confidence: { type: Number, min: 0, max: 100 },
      },
      biometryStatus: {
        type: String,
        enum: ['PENDING', 'APPROVED', 'REJECTED'],
        default: 'PENDING',
      },
      selfieUrl: { type: String, required: false },
      timestamp: { type: Date },
    },
    required: false,
  })
  biometry: {
    faceMatchScore: number;
    livenessCheck: {
      passed: boolean;
      confidence: number;
    };
    biometryStatus: string;
    selfieUrl?: string;
    timestamp: Date;
  };

  /**
   * Documents uploaded
   */
  @Prop({
    type: {
      dni: {
        uploaded: { type: Boolean, default: false },
        verified: { type: Boolean, default: false },
        url: { type: String, required: false },
        uploadedAt: { type: Date, required: false },
      },
      selfie: {
        uploaded: { type: Boolean, default: false },
        verified: { type: Boolean, default: false },
        url: { type: String, required: false },
        uploadedAt: { type: Date, required: false },
      },
      proof: {
        uploaded: { type: Boolean, default: false },
        verified: { type: Boolean, default: false },
        url: { type: String, required: false },
        uploadedAt: { type: Date, required: false },
      },
    },
    required: false,
  })
  documents: {
    dni: {
      uploaded: boolean;
      verified: boolean;
      url?: string;
      uploadedAt?: Date;
    };
    selfie: {
      uploaded: boolean;
      verified: boolean;
      url?: string;
      uploadedAt?: Date;
    };
    proof: {
      uploaded: boolean;
      verified: boolean;
      url?: string;
      uploadedAt?: Date;
    };
  };

  /**
   * Employment information completed
   */
  @Prop({ type: Boolean, default: false })
  employmentCompleted: boolean;

  /**
   * Banking information completed
   */
  @Prop({ type: Boolean, default: false })
  bankingCompleted: boolean;

  /**
   * Completed timestamp
   */
  @Prop({ type: Date, required: false })
  completedAt: Date;

  /**
   * IP address
   */
  @Prop({ type: String, required: false })
  ipAddress: string;

  /**
   * Device info
   */
  @Prop({ type: String, required: false })
  deviceInfo: string;

  /**
   * Failure reason (if failed)
   */
  @Prop({ type: String, required: false })
  failureReason: string;

  /**
   * Additional metadata (JSON string)
   */
  @Prop({ type: String, required: false })
  metadata: string;
}

export const OnboardingSessionSchema = SchemaFactory.createForClass(OnboardingSession);

// Indexes
OnboardingSessionSchema.index({ userId: 1, status: 1 });
OnboardingSessionSchema.index({ sessionId: 1 });
OnboardingSessionSchema.index({ status: 1, createdAt: -1 });
