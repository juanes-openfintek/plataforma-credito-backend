import { IsOptional, IsString, IsNumber, IsDate, IsEmail, IsArray, IsObject, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateClienteDto {
  @IsString()
  identificationType: string;

  @IsString()
  identificationNumber: string;

  @IsString()
  phone: string;

  @IsString()
  @IsOptional()
  personType?: string;

  @IsString()
  @IsOptional()
  otp?: string;

  @IsString()
  @IsOptional()
  pensionIssuer?: string;

  @IsString()
  @IsOptional()
  pensionType?: string;

  @IsString()
  @IsOptional()
  firstName?: string;

  @IsString()
  @IsOptional()
  lastName?: string;

  @IsDate()
  @Type(() => Date)
  @IsOptional()
  birthDate?: Date;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  gender?: string;

  @IsNumber()
  @IsOptional()
  monthlyIncome?: number;

  @IsNumber()
  @IsOptional()
  monthlyExpenses?: number;

  @IsNumber()
  @IsOptional()
  maxQuota?: number;

  @IsNumber()
  @IsOptional()
  maxAmount?: number;

  @IsNumber()
  @IsOptional()
  desiredQuota?: number;

  @IsBoolean()
  @IsOptional()
  requiresPortfolioPurchase?: boolean;

  @IsArray()
  @IsOptional()
  portfolioDebts?: any[];

  @IsString()
  @IsOptional()
  creditExperience?: string;

  @IsNumber()
  @IsOptional()
  creditAmount?: number;

  @IsNumber()
  @IsOptional()
  creditTerm?: number;

  @IsArray()
  @IsOptional()
  documents?: Array<{ documentType: string; fileName: string; fileUrl: string }>;

  @IsString()
  @IsOptional()
  healthStatus?: string;

  @IsString()
  @IsOptional()
  disability?: string;

  @IsString()
  @IsOptional()
  idIssuancePlace?: string;

  @IsDate()
  @Type(() => Date)
  @IsOptional()
  idIssuanceDate?: Date;

  @IsString()
  @IsOptional()
  birthPlace?: string;

  @IsString()
  @IsOptional()
  birthCountry?: string;

  @IsString()
  @IsOptional()
  educationLevel?: string;

  @IsString()
  @IsOptional()
  maritalStatus?: string;

  @IsObject()
  @IsOptional()
  laborInfo?: any;

  @IsObject()
  @IsOptional()
  financialDetails?: any;

  @IsString()
  @IsOptional()
  status?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}

export class UpdateClienteDto {
  @IsString()
  @IsOptional()
  status?: string;

  @IsNumber()
  @IsOptional()
  completionPercentage?: number;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsBoolean()
  @IsOptional()
  otpVerified?: boolean;

  @IsString()
  @IsOptional()
  pensionType?: string;

  @IsString()
  @IsOptional()
  pensionIssuer?: string;

  @IsString()
  @IsOptional()
  firstName?: string;

  @IsString()
  @IsOptional()
  lastName?: string;

  @IsString()
  @IsOptional()
  birthDate?: string;

  @IsString()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  gender?: string;

  @IsString()
  @IsOptional()
  idIssuancePlace?: string;

  @IsString()
  @IsOptional()
  idIssuanceDate?: string;

  @IsString()
  @IsOptional()
  birthPlace?: string;

  @IsString()
  @IsOptional()
  birthCountry?: string;

  @IsString()
  @IsOptional()
  riskStatus?: string;

  @IsNumber()
  @IsOptional()
  riskScore?: number;

  @IsOptional()
  riskDetails?: any;

  @IsNumber()
  @IsOptional()
  creditAmount?: number;

  @IsNumber()
  @IsOptional()
  creditTerm?: number;

  @IsNumber()
  @IsOptional()
  monthlyPayment?: number;

  @IsNumber()
  @IsOptional()
  totalInterest?: number;

  @IsNumber()
  @IsOptional()
  totalToPay?: number;

  @IsNumber()
  @IsOptional()
  monthlyIncome?: number;

  @IsNumber()
  @IsOptional()
  monthlyExpenses?: number;

  @IsNumber()
  @IsOptional()
  maxQuota?: number;

  @IsNumber()
  @IsOptional()
  maxAmount?: number;

  @IsNumber()
  @IsOptional()
  desiredQuota?: number;

  @IsBoolean()
  @IsOptional()
  requiresPortfolioPurchase?: boolean;

  @IsArray()
  @IsOptional()
  portfolioDebts?: any[];

  @IsArray()
  @IsOptional()
  documents?: any[];

  @IsString()
  @IsOptional()
  healthStatus?: string;

  @IsString()
  @IsOptional()
  disability?: string;

  @IsString()
  @IsOptional()
  educationLevel?: string;

  @IsString()
  @IsOptional()
  maritalStatus?: string;

  @IsOptional()
  laborInfo?: any;

  @IsOptional()
  financialDetails?: any;

  [key: string]: any;
}
