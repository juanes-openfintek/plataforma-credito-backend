import { IsNumber, IsOptional, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CalculateScoreDto {
  @ApiProperty({
    description: 'Monthly income',
    example: 3000,
    minimum: 0,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  @Min(0)
  monthlyIncome?: number;

  @ApiProperty({
    description: 'Current monthly debt',
    example: 500,
    minimum: 0,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  @Min(0)
  currentDebt?: number;

  @ApiProperty({
    description: 'Credit history in months',
    example: 24,
    minimum: 0,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  @Min(0)
  creditHistoryMonths?: number;

  @ApiProperty({
    description: 'Employment duration in months',
    example: 36,
    minimum: 0,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  @Min(0)
  employmentMonths?: number;

  @ApiProperty({
    description: 'Requested credit amount',
    example: 10000,
    minimum: 0,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  @Min(0)
  requestedAmount?: number;

  @ApiProperty({
    description: 'Requested term in months',
    example: 12,
    minimum: 1,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  @Min(1)
  requestedTerm?: number;
}
