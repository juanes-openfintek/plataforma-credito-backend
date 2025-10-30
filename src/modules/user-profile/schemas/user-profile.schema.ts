import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserProfileDocument = UserProfile & Document;

@Schema({ timestamps: true })
export class UserProfile {
  @Prop({ required: true, index: true })
  userId: string; // Firebase UID

  // DATOS PERSONALES
  @Prop({ required: true })
  firstName: string;

  @Prop({ required: true })
  lastName: string;

  @Prop({ required: true, unique: true })
  documentType: string; // DNI, Pasaporte, Cédula

  @Prop({ required: true, unique: true })
  documentNumber: string;

  @Prop({ required: true })
  dateOfBirth: Date;

  @Prop({ required: true })
  gender: string; // M, F, O

  @Prop({ required: true })
  nationality: string;

  // CONTACTO
  @Prop({ required: true })
  email: string;

  @Prop({ required: true })
  phone: string;

  @Prop()
  alternativePhone?: string;

  // DIRECCIÓN
  @Prop({
    type: {
      street: String,
      number: String,
      complement: { type: String, required: false },
      neighborhood: String,
      city: String,
      state: String,
      zipCode: String,
      country: String,
    },
    _id: false,
  })
  address: {
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };

  // INFORMACIÓN DE EMPLEO/INGRESOS
  @Prop({
    type: [
      {
        employmentType: String, // Empleado, Independiente, Pensionado, Negocio propio
        companyName: String,
        position: String,
        monthlyIncome: Number,
        startDate: Date,
        endDate: { type: Date, required: false },
        isCurrent: Boolean,
      },
    ],
    _id: false,
  })
  employmentHistory?: Array<{
    employmentType: string;
    companyName: string;
    position: string;
    monthlyIncome: number;
    startDate: Date;
    endDate?: Date;
    isCurrent: boolean;
  }>;

  // INFORMACIÓN BANCARIA MÚLTIPLE
  @Prop({
    type: [
      {
        accountHolderName: String,
        bankName: String,
        accountType: String, // Ahorros, Corriente
        accountNumber: String,
        accountNumberEncrypted: String,
        isDefault: Boolean,
      },
    ],
    _id: false,
  })
  bankAccounts?: Array<{
    accountHolderName: string;
    bankName: string;
    accountType: string;
    accountNumber: string;
    accountNumberEncrypted: string;
    isDefault: boolean;
  }>;

  // DOCUMENTOS
  @Prop({
    type: [
      {
        documentType: String, // DNI, Comprobante de ingresos, etc.
        fileUrl: String,
        uploadedAt: Date,
        expiryDate: { type: Date, required: false },
        verified: Boolean,
      },
    ],
    _id: false,
  })
  documents?: Array<{
    documentType: string;
    fileUrl: string;
    uploadedAt: Date;
    expiryDate?: Date;
    verified: boolean;
  }>;

  // REFERENCIAS PERSONALES
  @Prop({
    type: [
      {
        name: String,
        relationship: String,
        phone: String,
        email: { type: String, required: false },
      },
    ],
    _id: false,
  })
  personalReferences?: Array<{
    name: string;
    relationship: string;
    phone: string;
    email?: string;
  }>;

  // ESTADO KYC
  @Prop({ default: 'NOT_VERIFIED' }) // NOT_VERIFIED, PENDING, VERIFIED, REJECTED
  kycStatus: string;

  @Prop()
  kycRejectionReason?: string;

  // AUDITORÍA
  @Prop({
    type: [
      {
        field: String,
        oldValue: String,
        newValue: String,
        changedBy: String,
        changedAt: Date,
      },
    ],
    _id: false,
  })
  changeHistory?: Array<{
    field: string;
    oldValue: string;
    newValue: string;
    changedBy: string;
    changedAt: Date;
  }>;

  @Prop()
  createdAt?: Date;

  @Prop()
  updatedAt?: Date;
}

export const UserProfileSchema = SchemaFactory.createForClass(UserProfile);
