import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class CommercialUser extends Document {
  // Link to main User account
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, unique: true })
  user: Types.ObjectId;

  // Company Information
  @Prop({ type: String, required: true })
  companyName: string;

  @Prop({ type: String, required: true, unique: true })
  registrationNumber: string; // Business registration number

  @Prop({ type: String, required: true, unique: true })
  taxId: string; // NIT / Tax ID

  @Prop({ type: String })
  companyEmail: string;

  @Prop({ type: String, required: true })
  businessPhone: string;

  @Prop({ type: String })
  businessAddress: string;

  @Prop({ type: String })
  city: string;

  @Prop({ type: String })
  department: string;

  // Legal Representative
  @Prop({ type: String, required: true })
  legalRepresentativeName: string;

  @Prop({ type: String })
  legalRepresentativeDocument: string;

  // Company Details
  @Prop({ type: String })
  businessSector: string;

  @Prop({ type: Number })
  annualRevenue: number;

  @Prop({ type: Number, default: 0 })
  activeClients: number; // Number of clients being managed

  @Prop({ type: Number, default: 0 })
  approvedCredits: number;

  @Prop({ type: Number, default: 0 })
  disbursedAmount: number; // Total amount disbursed

  // Verification & Status
  @Prop({ type: Boolean, default: false })
  isVerified: boolean; // Admin verification

  @Prop({ type: Date })
  verificationDate: Date;

  @Prop({ type: Boolean, default: true })
  isActive: boolean;

  // Authorization Level
  @Prop({ type: String, enum: ['basic', 'premium', 'enterprise'], default: 'basic' })
  tier: string;

  @Prop({ type: [String] })
  authorizedSignatories: string[]; // Array of authorized user UIDs

  // Commission / Fee Structure
  @Prop({ type: Number, default: 0 })
  commissionPercentage: number;

  @Prop({ type: Number, default: 0 })
  platformFeePercentage: number;

  // Terms Acceptance
  @Prop({ type: Boolean, default: false })
  termsAccepted: boolean;

  @Prop({ type: Date })
  termsAcceptanceDate: Date;

  @Prop({ type: Boolean, default: false })
  privacyAccepted: boolean;

  @Prop({ type: Date })
  privacyAcceptanceDate: Date;

  // Timestamps are automatically added by @Schema({ timestamps: true })
}

export const CommercialUserSchema = SchemaFactory.createForClass(CommercialUser);

// Create indexes for better query performance
CommercialUserSchema.index({ user: 1 });
CommercialUserSchema.index({ registrationNumber: 1 });
CommercialUserSchema.index({ taxId: 1 });
CommercialUserSchema.index({ companyEmail: 1 });
CommercialUserSchema.index({ isActive: 1 });
CommercialUserSchema.index({ isVerified: 1 });
