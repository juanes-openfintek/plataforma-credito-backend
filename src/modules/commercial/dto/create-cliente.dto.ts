import { IsOptional, IsString, IsNumber, IsDate, IsEmail, IsArray, IsObject } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateClienteDto {
  // Step 1: Identification
  @IsString()
  identificationType: string;

  @IsString()
  identificationNumber: string;

  @IsString()
  phone: string;

  // Step 2: OTP
  @IsString()
  @IsOptional()
  otp?: string;

  // Step 3: Pension
  @IsString()
  @IsOptional()
  pensionIssuer?: string;

  @IsString()
  @IsOptional()
  pensionType?: string;

  // Step 4: Basic Data
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

  // Step 5: Financial
  @IsNumber()
  @IsOptional()
  monthlyIncome?: number;

  @IsNumber()
  @IsOptional()
  monthlyExpenses?: number;

  @IsString()
  @IsOptional()
  creditExperience?: string;

  // Step 7: Credit Simulation
  @IsNumber()
  @IsOptional()
  creditAmount?: number;

  @IsNumber()
  @IsOptional()
  creditTerm?: number;

  // Step 8: Documents
  @IsArray()
  @IsOptional()
  documents?: Array<{
    documentType: string;
    fileName: string;
    fileUrl: string;
  }>;

  // Step 9: Detailed Forms
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
  laborInfo?: {
    company: string;
    position: string;
    sector: string;
    yearsOfExperience: number;
    contractType: string;
  };

  @IsObject()
  @IsOptional()
  financialDetails?: {
    savingsAccounts: number;
    otherIncome: number;
    currentDebts: number;
    monthlyObligations: number;
  };

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

  // Allow updating any field
  [key: string]: any;
}
