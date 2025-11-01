import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import {
  ActivityType,
  PensionType,
  SimulationMode,
} from '../dto/create-simulation.dto';

@Schema({ timestamps: true })
export class Simulation extends Document {
  // Link to commercial user who created this simulation
  @Prop({ type: Types.ObjectId, ref: 'CommercialUser', required: true })
  commercialUser: Types.ObjectId;

  // Link to cliente if exists
  @Prop({ type: Types.ObjectId, ref: 'ClienteCreacion', required: false })
  cliente?: Types.ObjectId;

  // Client information (for saved simulations without cliente)
  @Prop({ type: String })
  clientName?: string;

  @Prop({ type: String })
  clientDocument?: string;

  // Preguntas iniciales
  @Prop({ type: Boolean, required: true })
  requiresPortfolioPurchase: boolean;

  @Prop({ type: String, enum: Object.values(PensionType) })
  pensionType?: PensionType;

  // Selección de producto
  @Prop({ type: Number, required: true, min: 0, max: 70 })
  brokeragePercentage: number;

  @Prop({ type: String, enum: Object.values(ActivityType), required: true })
  activityType: ActivityType;

  // Ingresos y descuentos
  @Prop({ type: Number, required: true })
  monthlyIncome: number;

  @Prop({
    type: [
      {
        amount: Number,
        description: String,
      },
    ],
  })
  monthlyDeductions: Array<{
    amount: number;
    description: string;
  }>;

  // Modo de simulación
  @Prop({ type: String, enum: Object.values(SimulationMode), required: true })
  simulationMode: SimulationMode;

  // Parámetros de simulación
  @Prop({ type: Number })
  desiredAmount?: number;

  @Prop({ type: Number })
  desiredQuota?: number;

  @Prop({ type: Number })
  desiredTerm?: number;

  // Resultados de la simulación
  @Prop({ type: Number })
  totalReachableAmount?: number; // Monto total alcanzable

  @Prop({ type: Number })
  maxDeliverableAmount?: number; // Monto máximo entregable

  @Prop({ type: Number })
  brokerageAmount?: number; // Corretaje

  @Prop({ type: Number })
  insuranceAmount?: number; // Seguro

  @Prop({ type: Number })
  guaranteeAmount?: number; // Fianzas

  @Prop({ type: Number })
  maxTerm?: number; // Plazo máximo

  @Prop({ type: Number })
  availableQuota?: number; // Cuota disponible para endeudamiento

  @Prop({ type: Number })
  finalQuota?: number; // Cuota final calculada

  @Prop({ type: Number })
  finalAmount?: number; // Monto final calculado

  @Prop({ type: Number })
  finalTerm?: number; // Plazo final calculado

  @Prop({
    type: [
      {
        month: Number,
        payment: Number,
        principal: Number,
        interest: Number,
        insurance: Number,
        brokerage: Number,
        guarantee: Number,
        balance: Number,
        dueDate: Date,
      },
    ],
  })
  paymentPlan?: Array<{
    month: number;
    payment: number;
    principal: number;
    interest: number;
    insurance: number;
    brokerage: number;
    guarantee: number;
    balance: number;
    dueDate: Date;
  }>;

  // Estado
  @Prop({
    type: String,
    enum: ['draft', 'saved', 'converted'],
    default: 'draft',
  })
  status: string; // draft, saved, converted (convertida a crédito)

  @Prop({ type: String })
  notes?: string;

  // Timestamps are automatically added by @Schema({ timestamps: true })
}

export const SimulationSchema = SchemaFactory.createForClass(Simulation);

// Create indexes for better query performance
SimulationSchema.index({ commercialUser: 1 });
SimulationSchema.index({ cliente: 1 });
SimulationSchema.index({ status: 1 });
SimulationSchema.index({ createdAt: -1 });
SimulationSchema.index({ commercialUser: 1, status: 1 });

