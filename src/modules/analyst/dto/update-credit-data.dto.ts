import {
  IsString,
  IsNumber,
  IsDate,
  IsOptional,
  IsBoolean,
  ValidateNested,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

class Analyst1ChecklistDto {
  @ApiProperty({ required: false })
  @IsBoolean()
  @IsOptional()
  kyc?: boolean;

  @ApiProperty({ required: false })
  @IsBoolean()
  @IsOptional()
  riskCentral?: boolean;

  @ApiProperty({ required: false })
  @IsBoolean()
  @IsOptional()
  debtCapacity?: boolean;
}

class Analyst2ChecklistDto {
  @ApiProperty({ required: false })
  @IsBoolean()
  @IsOptional()
  references?: boolean;

  @ApiProperty({ required: false })
  @IsBoolean()
  @IsOptional()
  insurabilityPolicies?: boolean;

  @ApiProperty({ required: false })
  @IsBoolean()
  @IsOptional()
  portfolioPurchase?: boolean;

  @ApiProperty({ required: false })
  @IsBoolean()
  @IsOptional()
  employmentOrPensionVerification?: boolean;
}

class Analyst3ChecklistDto {
  @ApiProperty({ required: false })
  @IsBoolean()
  @IsOptional()
  reviewAnalyst1?: boolean;

  @ApiProperty({ required: false })
  @IsBoolean()
  @IsOptional()
  reviewAnalyst2?: boolean;

  @ApiProperty({ required: false })
  @IsBoolean()
  @IsOptional()
  finalRectification?: boolean;
}

export class UpdateCreditDataDto {
  // Información personal
  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  secondName?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  lastname?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  secondLastname?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  phoneNumber?: string;

  @ApiProperty({ required: false })
  @IsDate()
  @Type(() => Date)
  @IsOptional()
  dateOfBirth?: Date;

  // Información laboral
  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  economicActivity?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  nameCompany?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  phoneNumberCompany?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  addressCompany?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  positionCompany?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  typeContract?: string;

  @ApiProperty({ required: false })
  @IsDate()
  @Type(() => Date)
  @IsOptional()
  dateOfAdmission?: Date;

  // Información financiera
  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  monthlyIncome?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  monthlyExpenses?: string;

  @ApiProperty({ required: false })
  @IsNumber()
  @IsOptional()
  amount?: number;

  @ApiProperty({ required: false })
  @IsNumber()
  @IsOptional()
  quotasNumber?: number;

  // CHECKLISTS POR ANALISTA (demo / trazabilidad)
  @ApiProperty({
    required: false,
    type: Analyst1ChecklistDto,
    description:
      'Checklist Analista 1 (KYC, centrales de riesgo, capacidad de endeudamiento)',
  })
  @ValidateNested()
  @Type(() => Analyst1ChecklistDto)
  @IsOptional()
  analyst1Checklist?: Analyst1ChecklistDto;

  @ApiProperty({
    required: false,
    type: Analyst2ChecklistDto,
    description:
      'Checklist Analista 2 (referencias, asegurabilidad, compra de cartera, verificación laboral/pensión)',
  })
  @ValidateNested()
  @Type(() => Analyst2ChecklistDto)
  @IsOptional()
  analyst2Checklist?: Analyst2ChecklistDto;

  @ApiProperty({
    required: false,
    type: Analyst3ChecklistDto,
    description: 'Checklist Analista 3 (rectificación/resumen robusto)',
  })
  @ValidateNested()
  @Type(() => Analyst3ChecklistDto)
  @IsOptional()
  analyst3Checklist?: Analyst3ChecklistDto;
}
