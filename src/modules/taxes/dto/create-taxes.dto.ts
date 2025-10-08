import { IsNumber } from 'class-validator';

export class CreateTaxesDto {
  @IsNumber()
  minAmount: number;

  @IsNumber()
  maxAmount: number;

  @IsNumber()
  rateEffectiveAnnual: number;

  @IsNumber()
  rateEffectiveMonthly: number;

  @IsNumber()
  rateDefault: number;

  @IsNumber()
  rateInsurance: number;

  @IsNumber()
  rateAdministration: number;
}
