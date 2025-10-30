import { ApiProperty } from '@nestjs/swagger';

export class ScoreBreakdownDto {
  @ApiProperty({
    description: 'Base score',
    example: 50,
  })
  baseScore: number;

  @ApiProperty({
    description: 'Income ratio score',
    example: 30,
  })
  incomeRatioScore: number;

  @ApiProperty({
    description: 'Credit history score',
    example: 20,
  })
  creditHistoryScore: number;

  @ApiProperty({
    description: 'Employment stability score',
    example: 15,
  })
  employmentStabilityScore: number;
}

export class ScoreResponseDto {
  @ApiProperty({
    description: 'Total credit score (0-100)',
    example: 85,
    minimum: 0,
    maximum: 100,
  })
  score: number;

  @ApiProperty({
    description: 'Score breakdown by category',
    type: ScoreBreakdownDto,
  })
  breakdown: ScoreBreakdownDto;

  @ApiProperty({
    description: 'Whether user is eligible for credit',
    example: true,
  })
  isEligible: boolean;

  @ApiProperty({
    description: 'Recommended credit amount',
    example: 10000,
  })
  recommendedAmount: number;

  @ApiProperty({
    description: 'Recommended term in months',
    example: 24,
  })
  recommendedTerm: number;

  @ApiProperty({
    description: 'Message with details',
    example: 'Excellent credit score! You qualify for amounts up to $15,000',
  })
  message: string;

  @ApiProperty({
    description: 'Approval likelihood percentage',
    example: 95,
  })
  approvalLikelihood: number;
}

export class PreApprovalResponseDto extends ScoreResponseDto {
  @ApiProperty({
    description: 'Estimated monthly payment',
    example: 450.75,
  })
  estimatedMonthlyPayment: number;

  @ApiProperty({
    description: 'Estimated total cost',
    example: 10818,
  })
  estimatedTotalCost: number;

  @ApiProperty({
    description: 'Estimated total interest',
    example: 818,
  })
  estimatedTotalInterest: number;

  @ApiProperty({
    description: 'Interest rate applied',
    example: 18.5,
  })
  interestRate: number;
}

export class ScoringRangeDto {
  @ApiProperty({
    description: 'Minimum score',
    example: 0,
  })
  minScore: number;

  @ApiProperty({
    description: 'Maximum score',
    example: 39,
  })
  maxScore: number;

  @ApiProperty({
    description: 'Range label',
    example: 'Muy bajo',
  })
  label: string;

  @ApiProperty({
    description: 'Maximum recommended amount',
    example: 0,
  })
  maxAmount: number;

  @ApiProperty({
    description: 'Color for UI',
    example: 'red',
  })
  color: string;

  @ApiProperty({
    description: 'Description',
    example: 'No califica para crédito',
  })
  description: string;
}

export class ScoringRangesResponseDto {
  @ApiProperty({
    description: 'List of scoring ranges',
    type: [ScoringRangeDto],
  })
  ranges: ScoringRangeDto[];

  @ApiProperty({
    description: 'Minimum score to qualify',
    example: 60,
  })
  minimumQualifyingScore: number;
}
