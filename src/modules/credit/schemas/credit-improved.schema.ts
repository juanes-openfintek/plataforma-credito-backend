import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type CreditDocument = Credit & Document;

// Estados posibles del crédito
export enum CreditStatus {
  DRAFT = 'DRAFT', // Borrador
  INCOMPLETE = 'INCOMPLETE', // Incompleto
  SUBMITTED = 'SUBMITTED', // Radicado, pendiente analista 1
  
  // Analista 1 - Validación Inicial
  ANALYST1_REVIEW = 'ANALYST1_REVIEW', // En revisión por analista 1
  ANALYST1_APPROVED = 'ANALYST1_APPROVED', // Aprobado por analista 1
  ANALYST1_RETURNED = 'ANALYST1_RETURNED', // Devuelto al usuario por analista 1
  
  // Analista 2 - Análisis Cualitativo
  ANALYST2_REVIEW = 'ANALYST2_REVIEW', // En revisión por analista 2
  ANALYST2_APPROVED = 'ANALYST2_APPROVED', // Aprobado por analista 2
  ANALYST2_RETURNED = 'ANALYST2_RETURNED', // Devuelto a analista 1
  
  // Analista 3 - Preaprobación y Documentos
  ANALYST3_REVIEW = 'ANALYST3_REVIEW', // En revisión por analista 3
  ANALYST3_APPROVED = 'ANALYST3_APPROVED', // Pre-aprobado por analista 3
  ANALYST3_RETURNED = 'ANALYST3_RETURNED', // Devuelto a analista 2
  
  // Firma y desembolso
  PENDING_SIGNATURE = 'PENDING_SIGNATURE', // Esperando firma electrónica
  READY_TO_DISBURSE = 'READY_TO_DISBURSE', // Listo para desembolsar
  DISBURSED = 'DISBURSED', // Desembolsado
  
  // Estados finales
  REJECTED = 'REJECTED', // Rechazado
  ACTIVE = 'ACTIVE', // Activo (pagando)
  PAID = 'PAID', // Pagado completamente
  DEFAULTED = 'DEFAULTED', // Incumplimiento
  
  // Estados legacy (mantener para compatibilidad)
  UNDER_REVIEW = 'UNDER_REVIEW', // En revisión (deprecado)
  PENDING_APPROVAL = 'PENDING_APPROVAL', // Pendiente aprobación (deprecado)
  APPROVED = 'APPROVED', // Aprobado (deprecado)
}

@Schema({ timestamps: true })
export class Credit {
  @Prop({ required: true, index: true })
  userId: string; // Firebase UID

  @Prop({ required: true, unique: true })
  creditNumber: string; // Número único de crédito

  // INFORMACIÓN DEL CRÉDITO
  @Prop({ required: true })
  creditTypeId: string; // Referencia a CreditType

  @Prop({ required: true })
  requestedAmount: number;

  @Prop()
  approvedAmount?: number;

  @Prop({ required: true })
  term: number; // En meses

  @Prop({ required: true })
  interestRate: number; // Tasa anual en %

  @Prop({ default: 0 })
  commission: number;

  @Prop({ default: 0 })
  insurance: number;

  @Prop()
  monthlyPayment?: number; // Cuota calculada

  @Prop()
  totalCost?: number; // Capital + intereses

  @Prop()
  amortizationTable?: Array<{
    month: number;
    payment: number;
    principal: number;
    interest: number;
    balance: number;
    dueDate: Date;
  }>;

  // ESTADO DEL CRÉDITO
  @Prop({ enum: CreditStatus, default: CreditStatus.DRAFT })
  status: CreditStatus;

  // CAMBIOS DE ESTADO
  @Prop({
    type: [
      {
        status: String,
        changedAt: Date,
        changedBy: String,
        reason: { type: String, required: false },
      },
    ],
    _id: false,
  })
  statusHistory?: Array<{
    status: string;
    changedAt: Date;
    changedBy: string;
    reason?: string;
  }>;

  // INFORMACIÓN DE APROBACIÓN
  @Prop()
  approverId?: string; // ID del aprobador

  @Prop()
  approvalDate?: Date;

  @Prop()
  approvalNotes?: string;

  @Prop()
  rejectionReason?: string;

  @Prop({ default: 0 })
  score?: number; // Score de aprobación automática (0-100)

  // INFORMACIÓN DE DESEMBOLSO
  @Prop()
  disburserId?: string;

  @Prop()
  disburseDate?: Date;

  @Prop()
  disburseMethod?: string; // Transferencia, Efectivo, Depósito

  @Prop()
  disburseVoucher?: string; // URL del comprobante

  // INFORMACIÓN DE PAGOS
  @Prop({ default: 0 })
  paidAmount: number;

  @Prop({ default: 0 })
  dueAmount: number;

  @Prop()
  nextPaymentDate?: Date;

  @Prop({ default: 0 })
  daysPastDue: number;

  @Prop({
    type: [
      {
        paymentDate: Date,
        amount: Number,
        principal: Number,
        interest: Number,
        voucher: { type: String, required: false },
        processedBy: String,
      },
    ],
    _id: false,
  })
  payments?: Array<{
    paymentDate: Date;
    amount: number;
    principal: number;
    interest: number;
    voucher?: string;
    processedBy: string;
  }>;

  // DOCUMENTOS REQUERIDOS
  @Prop({
    type: [
      {
        documentType: String,
        fileUrl: String,
        uploadedAt: Date,
        status: String, // PENDING, ACCEPTED, REJECTED
        rejectionReason: { type: String, required: false },
      },
    ],
    _id: false,
  })
  requiredDocuments?: Array<{
    documentType: string;
    fileUrl: string;
    uploadedAt: Date;
    status: string;
    rejectionReason?: string;
  }>;

  // COMENTARIOS DEL APROBADOR
  @Prop({
    type: [
      {
        comment: String,
        addedBy: String,
        addedAt: Date,
      },
    ],
    _id: false,
  })
  comments?: Array<{
    comment: string;
    addedBy: string;
    addedAt: Date;
  }>;

  // TRACKING DE ANALISTAS
  @Prop()
  analyst1Id?: string;

  @Prop()
  analyst1ReviewDate?: Date;

  @Prop()
  analyst1Notes?: string;

  @Prop()
  analyst2Id?: string;

  @Prop()
  analyst2ReviewDate?: Date;

  @Prop()
  analyst2Notes?: string;

  @Prop()
  analyst3Id?: string;

  @Prop()
  analyst3ReviewDate?: Date;

  @Prop()
  analyst3Notes?: string;

  // HISTORIAL DE DEVOLUCIONES
  @Prop({
    type: [
      {
        returnedBy: String,
        returnedTo: String,
        reason: String,
        date: Date,
        previousStatus: String,
      },
    ],
    _id: false,
  })
  returnHistory?: Array<{
    returnedBy: string;
    returnedTo: string;
    reason: string;
    date: Date;
    previousStatus: string;
  }>;

  // VALIDACIONES AUTOMÁTICAS
  @Prop({ type: Object })
  automaticValidations?: {
    kycScore?: number;
    riskCentralsCheck?: boolean;
    debtCapacityRatio?: number;
    blacklistCheck?: boolean;
    fraudScore?: number;
  };

  @Prop()
  createdAt?: Date;

  @Prop()
  updatedAt?: Date;
}

export const CreditSchema = SchemaFactory.createForClass(Credit);
