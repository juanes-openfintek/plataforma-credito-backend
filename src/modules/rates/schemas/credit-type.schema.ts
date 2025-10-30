import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type CreditTypeDocument = CreditType & Document;

@Schema({ timestamps: true })
export class CreditType {
  @Prop({ required: true, unique: true, index: true })
  name: string; // Personal, Comercial, Educativo

  @Prop()
  description?: string;

  @Prop({ required: true })
  minAmount: number;

  @Prop({ required: true })
  maxAmount: number;

  @Prop({ required: true })
  minTerm: number; // En meses

  @Prop({ required: true })
  maxTerm: number; // En meses

  @Prop({ required: true })
  baseInterestRate: number; // Tasa base en porcentaje anual

  @Prop({ default: 0 })
  commissionPercentage: number; // Comisión de apertura

  @Prop({ default: 0 })
  insurancePercentage: number; // Seguro

  @Prop({ default: true })
  isActive: boolean;

  @Prop()
  createdAt?: Date;

  @Prop()
  updatedAt?: Date;
}

export const CreditTypeSchema = SchemaFactory.createForClass(CreditType);
