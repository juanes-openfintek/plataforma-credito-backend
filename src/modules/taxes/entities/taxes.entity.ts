import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type TaxesDocument = HydratedDocument<Taxes>;

@Schema()
export class Taxes {
  @Prop({ type: Number, required: true })
  minAmount: number;

  @Prop({ type: Number, required: true })
  maxAmount: number;

  @Prop({ type: Number, required: true })
  rateEffectiveAnnual: number;

  @Prop({ type: Number, required: true })
  rateEffectiveMonthly: number;

  @Prop({ type: Number, required: true })
  rateDefault: number;

  @Prop({ type: Number, required: true })
  rateInsurance: number;

  @Prop({ type: Number, required: true })
  rateAdministration: number;
}

export const TaxesSchema = SchemaFactory.createForClass(Taxes);
