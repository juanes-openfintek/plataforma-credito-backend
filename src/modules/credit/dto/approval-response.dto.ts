import { ApiProperty } from '@nestjs/swagger';

export class ApprovalResponseDto {
  @ApiProperty({
    description: 'Whether the credit can be auto-approved',
    example: true,
  })
  canAutoApprove: boolean;

  @ApiProperty({
    description: 'Required approval level',
    example: 'AUTO',
    enum: ['AUTO', 'LEVEL1', 'LEVEL2', 'COMMITTEE'],
  })
  approvalLevel: 'AUTO' | 'LEVEL1' | 'LEVEL2' | 'COMMITTEE';

  @ApiProperty({
    description: 'Expected approval days',
    example: 0,
  })
  expectedApprovalDays: number;

  @ApiProperty({
    description: 'Reasons for rejection or additional requirements',
    example: [],
    type: [String],
  })
  rejectionReasons: string[];

  @ApiProperty({
    description: 'Validation details',
    example: {
      scoreValidation: { passed: true, score: 75, threshold: 60 },
      incomeValidation: { passed: true, income: 3000, minimum: 1000 },
      debtRatioValidation: { passed: true, ratio: 0.167, maximum: 0.7 },
      documentValidation: { passed: true, verified: true },
      amountValidation: { passed: true, amount: 5000, autoApproveLimit: 5000 },
    },
  })
  validations: {
    scoreValidation: {
      passed: boolean;
      score: number;
      threshold: number;
    };
    incomeValidation: {
      passed: boolean;
      income: number;
      minimum: number;
    };
    debtRatioValidation: {
      passed: boolean;
      ratio: number;
      maximum: number;
    };
    documentValidation: {
      passed: boolean;
      verified: boolean;
    };
    amountValidation: {
      passed: boolean;
      amount: number;
      autoApproveLimit: number;
    };
  };

  @ApiProperty({
    description: 'Required documents for this credit type',
    example: ['IDENTIFICATION', 'INCOME_PROOF', 'ADDRESS_PROOF', 'BANK_REFERENCE'],
    type: [String],
  })
  requiredDocuments: string[];

  @ApiProperty({
    description: 'Approval rules used for evaluation',
    example: {
      autoApproveUpTo: 5000,
      scoreThreshold: 60,
      maxLevelApprovals: { level1: 25000, level2: 100000 },
      minimumMonthlyIncome: 1000,
      maximumDebtToIncomeRatio: 0.7,
    },
  })
  approvalRules: {
    autoApproveUpTo: number;
    scoreThreshold: number;
    maxLevelApprovals: {
      level1: number;
      level2: number;
    };
    minimumMonthlyIncome?: number;
    maximumDebtToIncomeRatio?: number;
  };

  @ApiProperty({
    description: 'Recommendation message',
    example: 'This credit qualifies for automatic approval',
  })
  recommendation: string;
}
