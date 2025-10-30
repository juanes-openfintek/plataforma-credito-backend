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
    enum: ['WEB', 'MOBILE', 'ADMIN'],
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

  // Información financiera

  @Prop({ type: String, required: true })
  monthlyIncome: string;

  @Prop({ type: String, required: true })
  monthlyExpenses: string;

  @Prop({ type: String, required: true })
  experienceCredit: string;

  @Prop({ type: String, required: true })
  disburserMethod: string;

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
