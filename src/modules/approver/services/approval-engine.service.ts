import { Injectable } from '@nestjs/common';
import { CreditStatus } from '../../credit/schemas/credit-improved.schema';

export interface ApprovalRules {
  autoApproveUpTo: number; // Montos hasta X se aprueban automáticamente
  scoreThreshold: number; // Puntuación mínima requerida (0-100)
  maxLevelApprovals: {
    level1: number; // Monto máximo que puede aprobar nivel 1
    level2: number; // Monto máximo que puede aprobar nivel 2
  };
  minimumMonthlyIncome?: number;
  maximumDebtToIncomeRatio?: number; // 0.7 = 70%
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
    autoApproveUpTo: 5000, // Aprobar automáticamente créditos hasta $5000
    scoreThreshold: 60,
    maxLevelApprovals: {
      level1: 25000,
      level2: 100000,
    },
    minimumMonthlyIncome: 1000,
    maximumDebtToIncomeRatio: 0.7,
  };

  /**
   * Determina si un crédito puede ser aprobado automáticamente
   */
  canAutoApprove(context: ApprovalContext): boolean {
    // 1. Verificar si el monto está dentro del límite de auto-aprobación
    if (context.creditAmount > this.approvalRules.autoApproveUpTo) {
      return false;
    }

    // 2. Verificar score mínimo
    if (context.userScore < this.approvalRules.scoreThreshold) {
      return false;
    }

    // 3. Verificar ingresos mínimos
    if (
      this.approvalRules.minimumMonthlyIncome &&
      context.monthlyIncome < this.approvalRules.minimumMonthlyIncome
    ) {
      return false;
    }

    // 4. Verificar ratio deuda/ingreso
    const debtToIncomeRatio =
      context.currentMonthlyDebt / context.monthlyIncome;
    if (
      this.approvalRules.maximumDebtToIncomeRatio &&
      debtToIncomeRatio > this.approvalRules.maximumDebtToIncomeRatio
    ) {
      return false;
    }

    // 5. Verificar que documentos estén verificados
    if (!context.requiredDocumentsVerified) {
      return false;
    }

    return true;
  }

  /**
   * Retorna el siguiente estado del crédito basado en su flujo
   */
  getNextStatus(
    currentStatus: CreditStatus,
    action: 'submit' | 'review' | 'approve' | 'reject' | 'disburse' | 'activate' | 'complete' | 'default',
    context?: ApprovalContext,
  ): CreditStatus | null {
    const transitions: { [key in CreditStatus]?: { [key: string]: CreditStatus } } = {
      [CreditStatus.DRAFT]: {
        submit: CreditStatus.UNDER_REVIEW,
      },
      [CreditStatus.INCOMPLETE]: {
        submit: CreditStatus.UNDER_REVIEW,
      },
      [CreditStatus.UNDER_REVIEW]: {
        review: context && this.canAutoApprove(context)
          ? CreditStatus.APPROVED
          : CreditStatus.PENDING_APPROVAL,
        reject: CreditStatus.REJECTED,
      },
      [CreditStatus.PENDING_APPROVAL]: {
        approve: CreditStatus.APPROVED,
        reject: CreditStatus.REJECTED,
      },
      [CreditStatus.APPROVED]: {
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

  /**
   * Determina el nivel de aprobación requerido
   */
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

  /**
   * Calcula los documentos requeridos según el tipo de crédito
   */
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

  /**
   * Validar que todos los documentos estén verificados
   */
  areAllDocumentsVerified(documents: Array<{ status: string }>): boolean {
    if (!documents || documents.length === 0) {
      return false;
    }

    return documents.every((doc) => doc.status === 'ACCEPTED');
  }

  /**
   * Calcula los días hábiles esperados para aprobación
   */
  getExpectedApprovalDays(approvalLevel: string): number {
    const daysMap: { [key: string]: number } = {
      AUTO: 0, // Inmediato
      LEVEL1: 2,
      LEVEL2: 5,
      COMMITTEE: 10,
    };

    return daysMap[approvalLevel] || 5;
  }

  /**
   * Actualiza reglas de aprobación (solo para admin)
   */
  updateApprovalRules(newRules: Partial<ApprovalRules>): void {
    this.approvalRules = {
      ...this.approvalRules,
      ...newRules,
    };
  }

  /**
   * Obtiene reglas actuales
   */
  getApprovalRules(): ApprovalRules {
    return this.approvalRules;
  }
}
