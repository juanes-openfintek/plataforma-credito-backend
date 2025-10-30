import { Controller, Post, Get, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CalculationService } from './services/calculation.service';
import { CalculateScoreDto } from './dto/calculate-score.dto';
import {
  ScoreResponseDto,
  PreApprovalResponseDto,
  ScoringRangesResponseDto,
  ScoringRangeDto,
  ScoreBreakdownDto,
} from './dto/score-response.dto';

@ApiTags('Scoring')
@Controller('scoring')
export class ScoringController {
  constructor(private readonly calculationService: CalculationService) {}

  @Post('calculate')
  @ApiOperation({
    summary: 'Calculate credit score',
    description:
      'Calculates credit score based on user financial data without creating a credit request. Public endpoint.',
  })
  @ApiResponse({
    status: 200,
    description: 'Score calculated successfully',
    type: ScoreResponseDto,
  })
  calculateScore(@Body() calculateDto: CalculateScoreDto): ScoreResponseDto {
    // Calculate score using existing service
    const score = this.calculationService.calculateApprovalScore({
      monthlyIncome: calculateDto.monthlyIncome,
      currentDebt: calculateDto.currentDebt,
      creditHistoryMonths: calculateDto.creditHistoryMonths,
      employmentMonths: calculateDto.employmentMonths,
      requestedAmount: calculateDto.requestedAmount,
    });

    // Calculate breakdown
    const breakdown = this.calculateBreakdown(calculateDto);

    // Determine eligibility and recommendations
    const isEligible = score >= 60;
    const recommendedAmount = this.calculateRecommendedAmount(
      score,
      calculateDto.monthlyIncome || 0,
    );
    const recommendedTerm = this.calculateRecommendedTerm(score);
    const approvalLikelihood = this.calculateApprovalLikelihood(score);
    const message = this.generateScoreMessage(score, isEligible);

    return {
      score,
      breakdown,
      isEligible,
      recommendedAmount,
      recommendedTerm,
      message,
      approvalLikelihood,
    };
  }

  @Post('pre-approval')
  @ApiOperation({
    summary: 'Get pre-approval estimation',
    description:
      'Calculates score and provides credit estimation with monthly payments. Public endpoint.',
  })
  @ApiResponse({
    status: 200,
    description: 'Pre-approval calculated successfully',
    type: PreApprovalResponseDto,
  })
  getPreApproval(
    @Body() calculateDto: CalculateScoreDto,
  ): PreApprovalResponseDto {
    // Calculate base score
    const scoreResult = this.calculateScore(calculateDto);

    // Calculate credit estimation if amount and term provided
    const amount = calculateDto.requestedAmount || scoreResult.recommendedAmount;
    const term = calculateDto.requestedTerm || scoreResult.recommendedTerm;
    const interestRate = this.getInterestRateByScore(scoreResult.score);

    const creditCalculation = this.calculationService.calculateCredit(
      amount,
      interestRate,
      term,
    );

    return {
      ...scoreResult,
      estimatedMonthlyPayment: creditCalculation.monthlyPayment,
      estimatedTotalCost: creditCalculation.totalCost,
      estimatedTotalInterest: creditCalculation.totalInterest,
      interestRate,
    };
  }

  @Get('ranges')
  @ApiOperation({
    summary: 'Get scoring ranges',
    description:
      'Returns the scoring ranges with their corresponding eligibility and max amounts. Public endpoint.',
  })
  @ApiResponse({
    status: 200,
    description: 'Scoring ranges retrieved successfully',
    type: ScoringRangesResponseDto,
  })
  getScoringRanges(): ScoringRangesResponseDto {
    const ranges: ScoringRangeDto[] = [
      {
        minScore: 0,
        maxScore: 39,
        label: 'Muy bajo',
        maxAmount: 0,
        color: 'red',
        description: 'No califica para crédito',
      },
      {
        minScore: 40,
        maxScore: 59,
        label: 'Bajo',
        maxAmount: 2000,
        color: 'orange',
        description: 'Califica para montos pequeños con condiciones',
      },
      {
        minScore: 60,
        maxScore: 69,
        label: 'Regular',
        maxAmount: 5000,
        color: 'yellow',
        description: 'Califica para auto-aprobación hasta $5,000',
      },
      {
        minScore: 70,
        maxScore: 79,
        label: 'Bueno',
        maxAmount: 15000,
        color: 'lightgreen',
        description: 'Buen perfil crediticio',
      },
      {
        minScore: 80,
        maxScore: 89,
        label: 'Muy bueno',
        maxAmount: 30000,
        color: 'green',
        description: 'Excelente perfil crediticio',
      },
      {
        minScore: 90,
        maxScore: 100,
        label: 'Excelente',
        maxAmount: 50000,
        color: 'darkgreen',
        description: 'Perfil crediticio óptimo',
      },
    ];

    return {
      ranges,
      minimumQualifyingScore: 60,
    };
  }

  // Private helper methods

  private calculateBreakdown(data: CalculateScoreDto): ScoreBreakdownDto {
    const baseScore = 50;
    let incomeRatioScore = 0;
    let creditHistoryScore = 0;
    let employmentStabilityScore = 0;

    // Income ratio
    if (data.monthlyIncome) {
      const debtToIncomeRatio = (data.currentDebt || 0) / data.monthlyIncome;
      if (debtToIncomeRatio < 0.3) incomeRatioScore = 30;
      else if (debtToIncomeRatio < 0.5) incomeRatioScore = 20;
      else if (debtToIncomeRatio < 0.7) incomeRatioScore = 10;
    }

    // Credit history
    if (data.creditHistoryMonths) {
      if (data.creditHistoryMonths > 24) creditHistoryScore = 20;
      else if (data.creditHistoryMonths > 12) creditHistoryScore = 15;
      else if (data.creditHistoryMonths > 6) creditHistoryScore = 10;
    }

    // Employment stability
    if (data.employmentMonths) {
      if (data.employmentMonths > 24) employmentStabilityScore = 20;
      else if (data.employmentMonths > 12) employmentStabilityScore = 15;
      else if (data.employmentMonths > 6) employmentStabilityScore = 10;
    }

    return {
      baseScore,
      incomeRatioScore,
      creditHistoryScore,
      employmentStabilityScore,
    };
  }

  private calculateRecommendedAmount(
    score: number,
    monthlyIncome: number,
  ): number {
    if (score < 40) return 0;
    if (score < 60) return 2000;
    if (score < 70) return 5000;
    if (score < 80) return Math.min(monthlyIncome * 5, 15000);
    if (score < 90) return Math.min(monthlyIncome * 10, 30000);
    return Math.min(monthlyIncome * 15, 50000);
  }

  private calculateRecommendedTerm(score: number): number {
    if (score < 60) return 6;
    if (score < 70) return 12;
    if (score < 80) return 18;
    if (score < 90) return 24;
    return 36;
  }

  private calculateApprovalLikelihood(score: number): number {
    if (score < 40) return 0;
    if (score < 60) return 25;
    if (score < 70) return 50;
    if (score < 80) return 75;
    if (score < 90) return 90;
    return 98;
  }

  private getInterestRateByScore(score: number): number {
    if (score < 60) return 28; // High risk
    if (score < 70) return 22;
    if (score < 80) return 18;
    if (score < 90) return 15;
    return 12; // Best rate
  }

  private generateScoreMessage(score: number, isEligible: boolean): string {
    if (score < 40) {
      return 'Score muy bajo. Te recomendamos mejorar tu perfil antes de solicitar crédito.';
    }
    if (score < 60) {
      return 'Score bajo. Puedes calificar para montos pequeños con tasas más altas.';
    }
    if (score < 70) {
      return 'Score regular. Calificas para auto-aprobación hasta $5,000.';
    }
    if (score < 80) {
      return 'Buen score. Calificas para montos hasta $15,000 con buenas tasas.';
    }
    if (score < 90) {
      return 'Muy buen score. Calificas para montos hasta $30,000 con excelentes tasas.';
    }
    return 'Score excelente. Calificas para los mejores montos y tasas disponibles.';
  }
}
