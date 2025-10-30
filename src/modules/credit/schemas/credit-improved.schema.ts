import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type CreditDocument = Credit & Document;

// Estados posibles del crédito
export enum CreditStatus {
  DRAFT = 'DRAFT', // Borrador
  INCOMPLETE = 'INCOMPLETE', // Incompleto
  UNDER_REVIEW = 'UNDER_REVIEW', // En revisión
  PENDING_APPROVAL = 'PENDING_APPROVAL', // Pendiente aprobación
  APPROVED = 'APPROVED', // Aprobado
  REJECTED = 'REJECTED', // Rechazado
  DISBURSED = 'DISBURSED', // Desembolsado
  ACTIVE = 'ACTIVE', // Activo (pagando)
  PAID = 'PAID', // Pagado completamente
  DEFAULTED = 'DEFAULTED', // Incumplimiento
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

  @Prop()
  createdAt?: Date;

  @Prop()
  updatedAt?: Date;
}

export const CreditSchema = SchemaFactory.createForClass(Credit);
