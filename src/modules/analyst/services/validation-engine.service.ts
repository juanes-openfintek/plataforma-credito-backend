import { Injectable } from '@nestjs/common';
import { Credit } from '../../credit/entities/credit.entity';

export interface ValidationResult {
  passed: boolean;
  score: number;
  details: {
    kycScore: number;
    debtCapacityRatio: number;
    blacklistCheck: boolean;
    riskCentralsCheck: boolean;
    fraudScore: number;
    documentCompletion: number;
  };
  warnings: string[];
  errors: string[];
}

@Injectable()
export class ValidationEngineService {
  /**
   * Ejecuta todas las validaciones automáticas para un crédito
   */
  async runAutomaticValidations(credit: Credit): Promise<ValidationResult> {
    const kycScore = this.calculateKYCScore(credit);
    const debtCapacityRatio = this.calculateDebtCapacityRatio(credit);
    const blacklistCheck = await this.checkBlacklist(credit);
    const riskCentralsCheck = await this.checkRiskCentrals(credit);
    const fraudScore = this.calculateFraudScore(credit);
    const documentCompletion = this.checkDocumentCompletion(credit);

    const warnings: string[] = [];
    const errors: string[] = [];
    let passed = true;

    // Validar KYC Score
    if (kycScore < 60) {
      errors.push(`Score KYC bajo: ${kycScore}/100`);
      passed = false;
    } else if (kycScore < 75) {
      warnings.push(`Score KYC moderado: ${kycScore}/100`);
    }

    // Validar capacidad de endeudamiento
    if (debtCapacityRatio > 0.7) {
      errors.push(
        `Ratio de endeudamiento alto: ${(debtCapacityRatio * 100).toFixed(1)}%`,
      );
      passed = false;
    } else if (debtCapacityRatio > 0.5) {
      warnings.push(
        `Ratio de endeudamiento moderado: ${(debtCapacityRatio * 100).toFixed(1)}%`,
      );
    }

    // Validar listas restrictivas
    if (!blacklistCheck) {
      errors.push('Cliente aparece en lista restrictiva');
      passed = false;
    }

    // Validar centrales de riesgo
    if (!riskCentralsCheck) {
      errors.push('Problemas en centrales de riesgo');
      passed = false;
    }

    // Validar fraud score
    if (fraudScore > 70) {
      errors.push(`Alto riesgo de fraude: ${fraudScore}/100`);
      passed = false;
    } else if (fraudScore > 50) {
      warnings.push(`Riesgo moderado de fraude: ${fraudScore}/100`);
    }

    // Validar documentos
    if (documentCompletion < 100) {
      warnings.push(
        `Documentación incompleta: ${documentCompletion}% completado`,
      );
    }

    const totalScore = this.calculateTotalScore(
      kycScore,
      debtCapacityRatio,
      blacklistCheck,
      riskCentralsCheck,
      fraudScore,
      documentCompletion,
    );

    return {
      passed,
      score: totalScore,
      details: {
        kycScore,
        debtCapacityRatio,
        blacklistCheck,
        riskCentralsCheck,
        fraudScore,
        documentCompletion,
      },
      warnings,
      errors,
    };
  }

  /**
   * Calcula el score KYC basado en datos del solicitante
   */
  private calculateKYCScore(credit: Credit): number {
    let score = 50; // Base score

    // Edad
    if (credit.dateOfBirth) {
      const age = this.calculateAge(credit.dateOfBirth);
      if (age >= 25 && age <= 55) {
        score += 15;
      } else if (age >= 18 && age < 25) {
        score += 5;
      } else if (age > 55 && age <= 65) {
        score += 10;
      }
    }

    // Ingresos mensuales
    const income = parseFloat(credit.monthlyIncome || '0');
    if (income >= 5000000) {
      score += 20;
    } else if (income >= 3000000) {
      score += 15;
    } else if (income >= 1500000) {
      score += 10;
    } else if (income >= 1000000) {
      score += 5;
    }

    // Tipo de contrato
    if (credit.typeContract) {
      if (
        credit.typeContract.toLowerCase().includes('indefinido') ||
        credit.typeContract.toLowerCase().includes('fijo')
      ) {
        score += 10;
      } else if (credit.typeContract.toLowerCase().includes('termino fijo')) {
        score += 5;
      }
    }

    // Antigüedad laboral
    if (credit.dateOfAdmission) {
      const monthsEmployed = this.calculateMonthsEmployed(
        credit.dateOfAdmission,
      );
      if (monthsEmployed >= 24) {
        score += 5;
      } else if (monthsEmployed >= 12) {
        score += 3;
      }
    }

    return Math.min(100, score);
  }

  /**
   * Calcula el ratio de endeudamiento
   */
  private calculateDebtCapacityRatio(credit: Credit): number {
    const income = parseFloat(credit.monthlyIncome || '0');
    const expenses = parseFloat(credit.monthlyExpenses || '0');

    if (income === 0) return 1;

    return expenses / income;
  }

  /**
   * Verifica si el cliente está en listas restrictivas (simulado)
   */
  private async checkBlacklist(credit: Credit): Promise<boolean> {
    // Simulación simple: verificar por documento
    // En producción, esto consultaría una API real
    const documentNumber = credit.documentNumber;

    // Simulación: documentos que terminan en "666" están en lista negra
    if (documentNumber && documentNumber.endsWith('666')) {
      return false;
    }

    return true;
  }

  /**
   * Verifica centrales de riesgo (simulado)
   */
  private async checkRiskCentrals(credit: Credit): Promise<boolean> {
    // Simulación: basado en experiencia crediticia
    const experience = credit.experienceCredit?.toLowerCase() || '';

    if (
      experience.includes('malo') ||
      experience.includes('incumplimiento')
    ) {
      return false;
    }

    return true;
  }

  /**
   * Calcula score de riesgo de fraude
   */
  private calculateFraudScore(credit: Credit): number {
    let riskScore = 0;

    // Datos inconsistentes
    if (!credit.phoneNumber || credit.phoneNumber.length < 10) {
      riskScore += 20;
    }

    if (!credit.phoneNumberCompany || credit.phoneNumberCompany.length < 10) {
      riskScore += 15;
    }

    // Monto solicitado vs ingresos
    const income = parseFloat(credit.monthlyIncome || '0');
    const requestedAmount = credit.amount || 0;

    if (income > 0) {
      const amountToIncomeRatio = requestedAmount / income;
      if (amountToIncomeRatio > 20) {
        riskScore += 30;
      } else if (amountToIncomeRatio > 10) {
        riskScore += 15;
      }
    }

    // Edad inusual
    if (credit.dateOfBirth) {
      const age = this.calculateAge(credit.dateOfBirth);
      if (age < 18 || age > 80) {
        riskScore += 25;
      }
    }

    return Math.min(100, riskScore);
  }

  /**
   * Verifica completitud de documentos
   */
  private checkDocumentCompletion(credit: Credit): number {
    // Lista de campos requeridos
    const requiredFields = [
      'name',
      'lastname',
      'phoneNumber',
      'dateOfBirth',
      'documentType',
      'documentNumber',
      'economicActivity',
      'nameCompany',
      'phoneNumberCompany',
      'typeContract',
      'dateOfAdmission',
      'monthlyIncome',
      'monthlyExpenses',
    ];

    let completedFields = 0;

    requiredFields.forEach((field) => {
      if (credit[field] && credit[field] !== '') {
        completedFields++;
      }
    });

    return Math.round((completedFields / requiredFields.length) * 100);
  }

  /**
   * Calcula score total ponderado
   */
  private calculateTotalScore(
    kycScore: number,
    debtRatio: number,
    blacklist: boolean,
    riskCentrals: boolean,
    fraudScore: number,
    docCompletion: number,
  ): number {
    let totalScore = 0;

    // KYC Score (30%)
    totalScore += kycScore * 0.3;

    // Capacidad de pago (25%)
    const debtScore = Math.max(0, 100 - debtRatio * 100);
    totalScore += debtScore * 0.25;

    // Blacklist (20%)
    totalScore += (blacklist ? 100 : 0) * 0.2;

    // Risk Centrals (15%)
    totalScore += (riskCentrals ? 100 : 0) * 0.15;

    // Fraud Score inverso (5%)
    totalScore += (100 - fraudScore) * 0.05;

    // Document completion (5%)
    totalScore += docCompletion * 0.05;

    return Math.round(totalScore);
  }

  /**
   * Calcula edad a partir de fecha de nacimiento
   */
  private calculateAge(dateOfBirth: Date): number {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    return age;
  }

  /**
   * Calcula meses de antigüedad laboral
   */
  private calculateMonthsEmployed(dateOfAdmission: Date): number {
    const today = new Date();
    const admissionDate = new Date(dateOfAdmission);
    const diffTime = Math.abs(today.getTime() - admissionDate.getTime());
    const diffMonths = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 30));
    return diffMonths;
  }
}
