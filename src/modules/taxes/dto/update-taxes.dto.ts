import { IsNumber, IsOptional, IsString } from 'class-validator';

export class GetTaxesDto {
  @IsOptional()
  @IsNumber()
  minAmount: number;

  @IsOptional()
  @IsNumber()
  maxAmount: number;

  @IsOptional()
  @IsNumber()
  rateEffectiveAnnual: number;

  @IsOptional()
  @IsNumber()
  rateEffectiveMonthly: number;

  @IsOptional()
  @IsNumber()
  rateDefault: number;

  @IsOptional()
  @IsNumber()
  rateInsurance: number;

  @IsOptional()
  @IsNumber()
  rateAdministration: number;
}

export class UpdateTaxesDto extends GetTaxesDto {
  @IsString()
  id: string;
}
