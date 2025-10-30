import { IsString, IsNumber, IsOptional, IsBoolean, Min, Max } from 'class-validator';

export class CreateCreditTypeDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNumber()
  @Min(100)
  minAmount: number;

  @IsNumber()
  @Min(100)
  maxAmount: number;

  @IsNumber()
  @Min(1)
  minTerm: number;

  @IsNumber()
  @Min(1)
  maxTerm: number;

  @IsNumber()
  @Min(0.1)
  @Max(100)
  baseInterestRate: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(50)
  commissionPercentage?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(50)
  insurancePercentage?: number;
}

export class UpdateCreditTypeDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  @Min(100)
  minAmount?: number;

  @IsOptional()
  @IsNumber()
  @Min(100)
  maxAmount?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  minTerm?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  maxTerm?: number;

  @IsOptional()
  @IsNumber()
  @Min(0.1)
  @Max(100)
  baseInterestRate?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(50)
  commissionPercentage?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(50)
  insurancePercentage?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
