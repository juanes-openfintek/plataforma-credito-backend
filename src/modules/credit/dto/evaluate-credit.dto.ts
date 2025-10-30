import { IsNumber, IsBoolean, IsOptional, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class EvaluateCreditDto {
  @ApiProperty({
    description: 'Credit amount requested',
    example: 5000,
    minimum: 100,
  })
  @IsNumber()
  @Min(100)
  creditAmount: number;

  @ApiProperty({
    description: 'Credit term in months',
    example: 12,
    minimum: 1,
    maximum: 60,
  })
  @IsNumber()
  @Min(1)
  @Max(60)
  creditTerm: number;

  @ApiProperty({
    description: 'User credit score (0-100)',
    example: 75,
    minimum: 0,
    maximum: 100,
  })
  @IsNumber()
  @Min(0)
  @Max(100)
  userScore: number;

  @ApiProperty({
    description: 'Monthly income',
    example: 3000,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  monthlyIncome: number;

  @ApiProperty({
    description: 'Current monthly debt',
    example: 500,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  currentMonthlyDebt: number;

  @ApiProperty({
    description: 'Employment duration in months',
    example: 24,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  employmentMonths: number;

  @ApiProperty({
    description: 'Credit history duration in months',
    example: 36,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  creditHistoryMonths: number;

  @ApiProperty({
    description: 'Whether all required documents are verified',
    example: true,
  })
  @IsBoolean()
  requiredDocumentsVerified: boolean;

  @ApiProperty({
    description: 'Credit type (PERSONAL, COMMERCIAL, EDUCATION)',
    example: 'PERSONAL',
    required: false,
  })
  @IsOptional()
  creditType?: string;
}
