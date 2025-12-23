import { Injectable } from '@nestjs/common';
import { CreditStatus } from '../../credit/schemas/credit-improved.schema';

export interface ApprovalRules {
  autoApproveUpTo: number;
  scoreThreshold: number;
  maxLevelApprovals: {
    level1: number;
    level2: number;
  };
  minimumMonthlyIncome?: number;
  maximumDebtToIncomeRatio?: number;
}

export interface ApprovalContext {
  creditAmount: number;
  creditTerm: number;
  userScore: number;
  monthlyIncome: number;
  currentMonthlyDebt: number;
  employmentMonths: number;
  creditHistoryMonths: number;
  requiredDocumentsVerified: boolean;
}

@Injectable()
export class ApprovalEngineService {
  private approvalRules: ApprovalRules = {
    autoApproveUpTo: 5000,
    scoreThreshold: 60,
    maxLevelApprovals: {
      level1: 25000,
      level2: 100000,
    },
    minimumMonthlyIncome: 1000,
    maximumDebtToIncomeRatio: 0.7,
  };

  canAutoApprove(context: ApprovalContext): boolean {
    if (context.creditAmount > this.approvalRules.autoApproveUpTo) {
      return false;
    }
    if (context.userScore < this.approvalRules.scoreThreshold) {
      return false;
    }
    if (
      this.approvalRules.minimumMonthlyIncome &&
      context.monthlyIncome < this.approvalRules.minimumMonthlyIncome
    ) {
      return false;
    }
    const debtToIncomeRatio =
      context.currentMonthlyDebt / context.monthlyIncome;
    if (
      this.approvalRules.maximumDebtToIncomeRatio &&
      debtToIncomeRatio > this.approvalRules.maximumDebtToIncomeRatio
    ) {
      return false;
    }
    if (!context.requiredDocumentsVerified) {
      return false;
    }
    return true;
  }

  getNextStatus(
    currentStatus: CreditStatus,
    action: string,
    context?: ApprovalContext,
  ): CreditStatus | null {
    const transitions: any = {
      [CreditStatus.DRAFT]: {
        submit: CreditStatus.SUBMITTED,
      },
      [CreditStatus.INCOMPLETE]: {
        submit: CreditStatus.SUBMITTED,
      },
      [CreditStatus.SUBMITTED]: {
        review:
          context && this.canAutoApprove(context)
            ? CreditStatus.ANALYST3_APPROVED
            : CreditStatus.ANALYST1_REVIEW,
        reject: CreditStatus.REJECTED,
      },
      [CreditStatus.ANALYST1_REVIEW]: {
        approve: CreditStatus.ANALYST1_APPROVED,
        reject: CreditStatus.REJECTED,
      },
      [CreditStatus.ANALYST1_APPROVED]: {
        approve: CreditStatus.ANALYST2_APPROVED,
        reject: CreditStatus.REJECTED,
      },
      [CreditStatus.ANALYST2_APPROVED]: {
        approve: CreditStatus.ANALYST3_APPROVED,
        reject: CreditStatus.REJECTED,
      },
      [CreditStatus.ANALYST3_APPROVED]: {
        approve: CreditStatus.PENDING_SIGNATURE,
        reject: CreditStatus.REJECTED,
      },
      [CreditStatus.PENDING_SIGNATURE]: {
        disburse: CreditStatus.READY_TO_DISBURSE,
      },
      [CreditStatus.READY_TO_DISBURSE]: {
        disburse: CreditStatus.DISBURSED,
      },
      [CreditStatus.DISBURSED]: {
        activate: CreditStatus.ACTIVE,
      },
      [CreditStatus.ACTIVE]: {
        complete: CreditStatus.PAID,
        default: CreditStatus.DEFAULTED,
      },
    };

    return transitions[currentStatus]?.[action] || null;
  }

  getRequiredApprovalLevel(
    creditAmount: number,
  ): 'AUTO' | 'LEVEL1' | 'LEVEL2' | 'COMMITTEE' {
    if (creditAmount <= this.approvalRules.autoApproveUpTo) {
      return 'AUTO';
    }
    if (creditAmount <= this.approvalRules.maxLevelApprovals.level1) {
      return 'LEVEL1';
    }
    if (creditAmount <= this.approvalRules.maxLevelApprovals.level2) {
      return 'LEVEL2';
    }
    return 'COMMITTEE';
  }

  getRequiredDocuments(creditType: string): string[] {
    const documentsByType: { [key: string]: string[] } = {
      PERSONAL: [
        'IDENTIFICATION',
        'INCOME_PROOF',
        'ADDRESS_PROOF',
        'BANK_REFERENCE',
      ],
      COMMERCIAL: [
        'IDENTIFICATION',
        'BUSINESS_LICENSE',
        'FINANCIAL_STATEMENTS',
        'TAX_RETURN',
        'BANK_REFERENCE',
      ],
      EDUCATION: [
        'IDENTIFICATION',
        'ENROLLMENT_PROOF',
        'INCOME_PROOF',
        'ADDRESS_PROOF',
        'BANK_REFERENCE',
      ],
    };
    return documentsByType[creditType] || documentsByType.PERSONAL;
  }

  getExpectedApprovalDays(approvalLevel: string): number {
    const daysMap: { [key: string]: number } = {
      AUTO: 0,
      LEVEL1: 2,
      LEVEL2: 5,
      COMMITTEE: 10,
    };
    return daysMap[approvalLevel] || 5;
  }

  getApprovalRules(): ApprovalRules {
    return this.approvalRules;
  }
}

