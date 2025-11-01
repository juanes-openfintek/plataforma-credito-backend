import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class ClienteCreacion extends Document {
  // Link to commercial user who created this client
  @Prop({ type: Types.ObjectId, ref: 'CommercialUser', required: true })
  commercialUser: Types.ObjectId;

  // Step 1: Identification
  @Prop({ type: String, required: true, enum: ['CC', 'CE', 'PA', 'NIT'] })
  identificationType: string;

  @Prop({ type: String, required: true, unique: true })
  identificationNumber: string;

  @Prop({ type: String, required: true })
  phone: string;

  // Step 2: OTP Verification (stored for audit)
  @Prop({ type: Boolean, default: false })
  otpVerified: boolean;

  @Prop({ type: Date })
  otpVerificationDate: Date;

  // Step 3: Pension Data
  @Prop({ type: String })
  pensionIssuer: string; // Administradora de pensiones

  @Prop({ type: String })
  pensionType: string; // Tipo de pensión

  // Step 4: Basic Data
  @Prop({ type: String })
  firstName: string;

  @Prop({ type: String })
  lastName: string;

  @Prop({ type: Date })
  birthDate: Date;

  @Prop({ type: String })
  email: string;

  @Prop({ type: String, enum: ['masculino', 'femenino', 'otro'] })
  gender: string;

  // Step 5: Financial Information
  @Prop({ type: Number })
  monthlyIncome: number;

  @Prop({ type: Number })
  monthlyExpenses: number;

  @Prop({ type: String })
  creditExperience: string; // excelente, buena, regular, pobre, sin-historial

  // Step 6: Risk Central (stored response)
  @Prop({ type: String, default: 'pendiente' })
  riskStatus: string; // pendiente, aprobado, rechazado, bajo, medio, alto

  @Prop({ type: Number })
  riskScore: number;

  @Prop({ type: Object })
  riskDetails: any; // Detalles completos de la consulta

  // Step 7: Credit Simulation
  @Prop({ type: Number })
  creditAmount: number;

  @Prop({ type: Number })
  creditTerm: number; // months

  @Prop({ type: Number })
  monthlyPayment: number;

  @Prop({ type: Number })
  totalInterest: number;

  @Prop({ type: Number })
  totalInsurance: number;

  @Prop({ type: Number })
  totalAdministration: number;

  @Prop({ type: Number })
  totalIva: number;

  @Prop({ type: Number })
  totalToPay: number;

  // Step 8: Requirements (PDF files)
  @Prop({
    type: [
      {
        documentType: String, // cedula, certificadoIngresos, libreta, etc
        fileName: String,
        fileUrl: String, // URL to stored file in cloud storage
        uploadDate: Date,
      },
    ],
  })
  documents: any[];

  // Step 9: Detailed Forms
  @Prop({ type: String })
  healthStatus: string; // excelente, buena, regular, problemas

  @Prop({ type: String })
  disability: string; // no, parcial, total

  @Prop({ type: String })
  idIssuancePlace: string;

  @Prop({ type: Date })
  idIssuanceDate: Date;

  @Prop({ type: String })
  birthPlace: string;

  @Prop({ type: String, default: 'Colombia' })
  birthCountry: string;

  @Prop({ type: String })
  educationLevel: string; // primaria, secundaria, tecnico, profesional, postgrado

  @Prop({ type: String })
  maritalStatus: string; // soltero, casado, divorciado, viudo, union-libre

  @Prop({
    type: {
      company: String,
      position: String,
      sector: String,
      yearsOfExperience: Number,
      contractType: String, // indefinido, fijo, temporal, practicas
    },
  })
  laborInfo: any;

  @Prop({
    type: {
      savingsAccounts: Number,
      otherIncome: Number,
      currentDebts: Number,
      monthlyObligations: Number,
    },
  })
  financialDetails: any;

  // Overall Status
  @Prop({
    type: String,
    enum: ['iniciado', 'en-progreso', 'completado', 'aprobado', 'rechazado', 'desembolsado'],
    default: 'iniciado',
  })
  status: string;

  @Prop({ type: Number, default: 0 })
  completionPercentage: number; // 0-100%

  @Prop({ type: Date })
  submissionDate: Date;

  // Notes
  @Prop({ type: String })
  notes: string;

  // Timestamps are automatically added by @Schema({ timestamps: true })
}

export const ClienteCreacionSchema = SchemaFactory.createForClass(ClienteCreacion);

// Create indexes for better query performance
ClienteCreacionSchema.index({ commercialUser: 1 });
ClienteCreacionSchema.index({ identificationNumber: 1 });
ClienteCreacionSchema.index({ status: 1 });
ClienteCreacionSchema.index({ createdAt: -1 });
ClienteCreacionSchema.index({ commercialUser: 1, status: 1 });
