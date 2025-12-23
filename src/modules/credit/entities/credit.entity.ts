import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model, Types } from 'mongoose';
import { User } from '../../../modules/auth/entities/user.entity';
import { CreditStatus } from '../interfaces';
import { Taxes } from '../../../modules/taxes/entities/taxes.entity';

export type UserDocument = HydratedDocument<Credit>;

@Schema()
export class Credit {
  @Prop({ type: String, required: true, default: CreditStatus.pending })
  status: string;

  @Prop({ type: Number, unique: true })
  code: number;

  @Prop({ type: String, unique: true })
  radicationNumber: string;

  @Prop({ type: Date })
  radicationDate: Date;

  @Prop({
    type: String,
    enum: ['WEB', 'MOBILE', 'ADMIN', 'COMMERCIAL'],
    default: 'WEB'
  })
  radicationSource: string;

  @Prop({ type: String })
  details: string;

  // Relaciones

  @Prop({ type: Types.ObjectId, ref: 'User' })
  user: User;

  @Prop({ type: Types.ObjectId, ref: 'Taxes' })
  taxes: Taxes;

  @Prop({ type: Types.ObjectId, ref: 'Account', required: false })
  account: any;

  // Información del crédito
  @Prop({ type: Number, required: true })
  amount: number;

  @Prop({ type: Number, required: true })
  quotasNumber: number;

  @Prop({ type: Date, required: true })
  maxDate: Date;

  @Prop({ type: Date, default: Date.now })
  created: Date;

  // Información personal
  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: String, required: true })
  secondName: string;

  @Prop({ type: String, required: true })
  lastname: string;

  @Prop({ type: String, required: true })
  secondLastname: string;

  @Prop({ type: String, required: true })
  phoneNumber: string;

  @Prop({ type: Date, required: true })
  dateOfBirth: Date;

  @Prop({ type: String, required: true })
  documentType: string;

  @Prop({ type: String, required: true })
  documentNumber: string;

  @Prop({ type: String, enum: ['pensionado', 'empleado'] })
  personType?: string;

  // Información de laboral

  @Prop({ type: String, required: true })
  economicActivity: string;

  @Prop({ type: String, required: true })
  nameCompany: string;

  @Prop({ type: String, required: true })
  phoneNumberCompany: string;

  @Prop({ type: String, required: true })
  addressCompany: string;

  @Prop({ type: String, required: true })
  positionCompany: string;

  @Prop({ type: String, required: true })
  typeContract: string;

  @Prop({ type: Date, required: true })
  dateOfAdmission: Date;

  // Información de pensión (si aplica)
  @Prop({ type: String })
  pensionIssuer?: string; // Administradora de pensiones

  @Prop({ type: String })
  pensionType?: string; // Tipo de pensión

  // Información financiera

  @Prop({ type: String, required: true })
  monthlyIncome: string;

  @Prop({ type: String, required: true })
  monthlyExpenses: string;

  @Prop({ type: String, required: true })
  experienceCredit: string;

  @Prop({ type: String, required: true })
  disburserMethod: string;

  // Información bancaria para desembolso
  @Prop({ type: String })
  bankName?: string;

  @Prop({ type: String })
  bankAccountType?: string;

  @Prop({ type: String })
  bankAccountNumber?: string;

  // Referencias personales

  @Prop({ type: String, required: true })
  nameReferencePersonal: string;

  @Prop({ type: String, required: true })
  parentescoReferencePersonal: string;

  @Prop({ type: String, required: true })
  phoneNumberReferencePersonal: string;

  @Prop({ type: String, required: true })
  departamentReferencePersonal: string;

  @Prop({ type: String, required: true })
  municipalityReferencePersonal: string;

  // TRACKING DE ANALISTAS
  @Prop({ type: String })
  analyst1Id?: string;

  @Prop({ type: Date })
  analyst1ReviewDate?: Date;

  @Prop({ type: String })
  analyst1Notes?: string;

  @Prop({ type: String })
  analyst2Id?: string;

  @Prop({ type: Date })
  analyst2ReviewDate?: Date;

  @Prop({ type: String })
  analyst2Notes?: string;

  @Prop({ type: String })
  analyst3Id?: string;

  @Prop({ type: Date })
  analyst3ReviewDate?: Date;

  @Prop({ type: String })
  analyst3Notes?: string;

  // CHECKLISTS POR ANALISTA (tareas específicas / demo)
  @Prop({
    type: {
      kyc: { type: Boolean, default: false },
      riskCentral: { type: Boolean, default: false },
      debtCapacity: { type: Boolean, default: false },
    },
    _id: false,
    default: { kyc: false, riskCentral: false, debtCapacity: false },
  })
  analyst1Checklist?: {
    kyc: boolean;
    riskCentral: boolean;
    debtCapacity: boolean;
  };

  @Prop({
    type: {
      references: { type: Boolean, default: false },
      insurabilityPolicies: { type: Boolean, default: false },
      portfolioPurchase: { type: Boolean, default: false },
      employmentOrPensionVerification: { type: Boolean, default: false },
    },
    _id: false,
    default: {
      references: false,
      insurabilityPolicies: false,
      portfolioPurchase: false,
      employmentOrPensionVerification: false,
    },
  })
  analyst2Checklist?: {
    references: boolean;
    insurabilityPolicies: boolean;
    portfolioPurchase: boolean;
    employmentOrPensionVerification: boolean;
  };

  @Prop({
    type: {
      reviewAnalyst1: { type: Boolean, default: false },
      reviewAnalyst2: { type: Boolean, default: false },
      finalRectification: { type: Boolean, default: false },
    },
    _id: false,
    default: { reviewAnalyst1: false, reviewAnalyst2: false, finalRectification: false },
  })
  analyst3Checklist?: {
    reviewAnalyst1: boolean;
    reviewAnalyst2: boolean;
    finalRectification: boolean;
  };

  // HISTORIAL DE DEVOLUCIONES
  @Prop({
    type: [
      {
        returnedBy: String,
        returnedByRole: String,
        returnedTo: String,
        reason: String,
        date: Date,
        previousStatus: String,
        attachments: [{
          fileName: String,
          fileUrl: String,
          documentType: String,
        }],
      },
    ],
    _id: false,
  })
  returnHistory?: Array<{
    returnedBy: string;
    returnedByRole?: string;
    returnedTo: string;
    reason: string;
    date: Date;
    previousStatus: string;
    attachments?: Array<{
      fileName: string;
      fileUrl: string;
      documentType: string;
    }>;
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

  // Compra de cartera (trazabilidad para analistas)
  @Prop({ type: Boolean, default: false })
  requiresPortfolioPurchase?: boolean;

  @Prop({ type: Array })
  portfolioDebts?: any[];

  @Prop({ type: Number })
  maxQuota?: number;

  @Prop({ type: Number })
  maxAmount?: number;

  @Prop({ type: Number })
  desiredQuota?: number;
}

export const CreditSchema = SchemaFactory.createForClass(Credit);

CreditSchema.pre('save', async function (next) {
  try {
    if (this.isNew) {
      const CreditModel: Model<Credit> = this.constructor as Model<Credit>;
      const lastDocument = await CreditModel.findOne({}, 'code').sort('-code');
      const newCode = (lastDocument?.code || 0) + 1;
      this['code'] = newCode;

      // Generate radicationNumber: RAD-YYYY-MMDD-XXXXX
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      const codeFormatted = String(newCode).padStart(5, '0');

      this['radicationNumber'] = `RAD-${year}-${month}${day}-${codeFormatted}`;
      this['radicationDate'] = now;

      // Set default radicationSource if not provided
      if (!this['radicationSource']) {
        this['radicationSource'] = 'WEB';
      }
    }
    next();
  } catch (error) {
    next(error);
  }
});
