import { Injectable } from '@nestjs/common';

export interface AmortizationPayment {
  month: number;
  payment: number;
  principal: number;
  interest: number;
  balance: number;
  dueDate: Date;
}

export interface CalculationResult {
  monthlyPayment: number;
  totalCost: number;
  totalInterest: number;
  amortizationTable: AmortizationPayment[];
}

@Injectable()
export class CalculationService {
  /**
   * Calcula la cuota mensual usando fórmula de amortización francesa
   * PMT = (P * r * (1 + r)^n) / ((1 + r)^n - 1)
   * P = Principal, r = tasa mensual, n = número de pagos
   */
  calculateMonthlyPayment(
    principal: number,
    annualInterestRate: number,
    termInMonths: number,
  ): number {
    if (termInMonths === 0) return 0;
    
    const monthlyRate = annualInterestRate / 100 / 12;
    
    if (monthlyRate === 0) {
      return principal / termInMonths;
    }

    const numerator =
      principal * monthlyRate * Math.pow(1 + monthlyRate, termInMonths);
    const denominator = Math.pow(1 + monthlyRate, termInMonths) - 1;

    return numerator / denominator;
  }

  /**
   * Genera tabla de amortización completa
   */
  generateAmortizationTable(
    principal: number,
    annualInterestRate: number,
    termInMonths: number,
    startDate: Date = new Date(),
  ): AmortizationPayment[] {
    const monthlyPayment = this.calculateMonthlyPayment(
      principal,
      annualInterestRate,
      termInMonths,
    );
    const monthlyRate = annualInterestRate / 100 / 12;
    const table: AmortizationPayment[] = [];

    let balance = principal;
    let currentDate = new Date(startDate);

    for (let month = 1; month <= termInMonths; month++) {
      const interestPayment = balance * monthlyRate;
      const principalPayment = monthlyPayment - interestPayment;
      balance -= principalPayment;

      // Evitar números negativos muy pequeños por redondeo
      if (balance < 0.01) {
        balance = 0;
      }

      // Suma 1 mes a la fecha
      currentDate = new Date(currentDate);
      currentDate.setMonth(currentDate.getMonth() + 1);

      table.push({
        month,
        payment: parseFloat(monthlyPayment.toFixed(2)),
        principal: parseFloat(principalPayment.toFixed(2)),
        interest: parseFloat(interestPayment.toFixed(2)),
        balance: parseFloat(balance.toFixed(2)),
        dueDate: new Date(currentDate),
      });
    }

    return table;
  }

  /**
   * Calcula el costo total del crédito
   */
  calculateTotalCost(
    principal: number,
    annualInterestRate: number,
    termInMonths: number,
  ): number {
    const monthlyPayment = this.calculateMonthlyPayment(
      principal,
      annualInterestRate,
      termInMonths,
    );
    return monthlyPayment * termInMonths;
  }

  /**
   * Calcula el total de intereses a pagar
   */
  calculateTotalInterest(
    principal: number,
    annualInterestRate: number,
    termInMonths: number,
  ): number {
    const totalCost = this.calculateTotalCost(
      principal,
      annualInterestRate,
      termInMonths,
    );
    return totalCost - principal;
  }

  /**
   * Realiza cálculo completo
   */
  calculateCredit(
    principal: number,
    annualInterestRate: number,
    termInMonths: number,
    startDate?: Date,
  ): CalculationResult {
    return {
      monthlyPayment: parseFloat(
        this.calculateMonthlyPayment(principal, annualInterestRate, termInMonths).toFixed(2),
      ),
      totalCost: parseFloat(
        this.calculateTotalCost(principal, annualInterestRate, termInMonths).toFixed(2),
      ),
      totalInterest: parseFloat(
        this.calculateTotalInterest(
          principal,
          annualInterestRate,
          termInMonths,
        ).toFixed(2),
      ),
      amortizationTable: this.generateAmortizationTable(
        principal,
        annualInterestRate,
        termInMonths,
        startDate,
      ),
    };
  }

  /**
   * Valida parámetros de crédito
   */
  validateCreditParameters(
    amount: number,
    minAmount: number,
    maxAmount: number,
    term: number,
    minTerm: number,
    maxTerm: number,
  ): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (amount < minAmount) {
      errors.push(
        `El monto debe ser mayor o igual a ${minAmount}`,
      );
    }

    if (amount > maxAmount) {
      errors.push(
        `El monto debe ser menor o igual a ${maxAmount}`,
      );
    }

    if (term < minTerm) {
      errors.push(
        `El plazo debe ser mayor o igual a ${minTerm} meses`,
      );
    }

    if (term > maxTerm) {
      errors.push(
        `El plazo debe ser menor o igual a ${maxTerm} meses`,
      );
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Calcula scoring automático de aprobación
   * Retorna puntuación de 0-100
   */
  calculateApprovalScore(userData: {
    monthlyIncome?: number;
    currentDebt?: number;
    creditHistoryMonths?: number;
    employmentMonths?: number;
    requestedAmount?: number;
  }): number {
    let score = 50; // Base score

    // Ingresos: hasta +30 puntos
    if (userData.monthlyIncome) {
      const debtToIncomeRatio = (userData.currentDebt || 0) / userData.monthlyIncome;
      if (debtToIncomeRatio < 0.3) score += 30;
      else if (debtToIncomeRatio < 0.5) score += 20;
      else if (debtToIncomeRatio < 0.7) score += 10;
    }

    // Historial de crédito: hasta +20 puntos
    if (userData.creditHistoryMonths) {
      if (userData.creditHistoryMonths > 24) score += 20;
      else if (userData.creditHistoryMonths > 12) score += 15;
      else if (userData.creditHistoryMonths > 6) score += 10;
    }

    // Estabilidad laboral: hasta +20 puntos
    if (userData.employmentMonths) {
      if (userData.employmentMonths > 24) score += 20;
      else if (userData.employmentMonths > 12) score += 15;
      else if (userData.employmentMonths > 6) score += 10;
    }

    // Límite máximo 100
    return Math.min(score, 100);
  }
}
