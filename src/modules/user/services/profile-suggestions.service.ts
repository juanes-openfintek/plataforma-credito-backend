import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../../auth/entities/user.entity';
import { Credit } from '../../credit/entities/credit.entity';
import { SuggestionItemDto, SuggestionsResponseDto } from '../dto/suggestion-response.dto';

@Injectable()
export class ProfileSuggestionsService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Credit.name) private creditModel: Model<Credit>,
  ) {}

  /**
   * Analyzes user profile and returns suggestions for improvement
   */
  async getUserSuggestions(userId: string): Promise<SuggestionsResponseDto> {
    const user = await this.userModel.findById(userId);

    if (!user) {
      throw new Error('User not found');
    }

    // Get user's credits to analyze credit history
    const userCredits = await this.creditModel.find({ user: userId });

    const suggestions: SuggestionItemDto[] = [];
    let totalImpact = 0;

    // Check personal information
    const personalInfoSuggestions = this.checkPersonalInfo(user);
    suggestions.push(...personalInfoSuggestions);

    // Check documents (simulated - in real app would check actual uploads)
    const documentSuggestions = this.checkDocuments(user);
    suggestions.push(...documentSuggestions);

    // Check credit history
    const creditHistorySuggestions = this.checkCreditHistory(userCredits);
    suggestions.push(...creditHistorySuggestions);

    // Calculate total impact
    totalImpact = suggestions.reduce((sum, s) => sum + s.impactOnScore, 0);

    // Calculate current score (simplified - in real app use actual scoring service)
    const currentScore = this.calculateCurrentScore(user, userCredits);
    const potentialScore = Math.min(currentScore - totalImpact, 100);

    // Calculate completion percentage
    const completionPercentage = this.calculateProfileCompletion(user);

    return {
      suggestions,
      totalImpact,
      currentScore,
      potentialScore,
      hasIncompleteProfile: completionPercentage < 100,
      completionPercentage,
    };
  }

  private checkPersonalInfo(user: User): SuggestionItemDto[] {
    const suggestions: SuggestionItemDto[] = [];

    if (!user.documentNumber) {
      suggestions.push({
        category: 'PERSONAL_INFO',
        priority: 'HIGH',
        message: 'Número de documento no registrado',
        impactOnScore: -15,
        action: 'Completar número de documento en tu perfil',
        timeEstimate: '2 minutos',
      });
    }

    if (!user.documentType) {
      suggestions.push({
        category: 'PERSONAL_INFO',
        priority: 'HIGH',
        message: 'Tipo de documento no especificado',
        impactOnScore: -10,
        action: 'Seleccionar tipo de documento',
        timeEstimate: '1 minuto',
      });
    }

    if (!user.name || !user.lastname) {
      suggestions.push({
        category: 'PERSONAL_INFO',
        priority: 'HIGH',
        message: 'Nombre completo incompleto',
        impactOnScore: -12,
        action: 'Completar nombre y apellidos',
        timeEstimate: '2 minutos',
      });
    }

    if (!user.emailVerified) {
      suggestions.push({
        category: 'PERSONAL_INFO',
        priority: 'MEDIUM',
        message: 'Correo electrónico no verificado',
        impactOnScore: -8,
        action: 'Verificar tu correo electrónico',
        timeEstimate: '3 minutos',
      });
    }

    return suggestions;
  }

  private checkDocuments(user: User): SuggestionItemDto[] {
    const suggestions: SuggestionItemDto[] = [];

    // Simulated document checks (in real app, check actual file uploads)
    // For now, we'll check if user has completed basic profile as proxy

    if (!user.documentNumber) {
      suggestions.push({
        category: 'DOCUMENTS',
        priority: 'HIGH',
        message: 'Documentos de identidad no cargados',
        impactOnScore: -20,
        action: 'Cargar copia de DNI o cédula',
        timeEstimate: '5 minutos',
      });
    }

    return suggestions;
  }

  private checkCreditHistory(credits: Credit[]): SuggestionItemDto[] {
    const suggestions: SuggestionItemDto[] = [];

    if (credits.length === 0) {
      suggestions.push({
        category: 'CREDIT_HISTORY',
        priority: 'LOW',
        message: 'Sin historial crediticio en la plataforma',
        impactOnScore: -5,
        action: 'Solicitar tu primer crédito para construir historial',
        timeEstimate: '10 minutos',
      });
    }

    // Check for defaulted credits
    const defaultedCredits = credits.filter(c => c.status === 'DEFAULTED');
    if (defaultedCredits.length > 0) {
      suggestions.push({
        category: 'CREDIT_HISTORY',
        priority: 'HIGH',
        message: `Tienes ${defaultedCredits.length} crédito(s) en mora`,
        impactOnScore: -30,
        action: 'Ponerse al día con los pagos pendientes',
        timeEstimate: 'Variable',
      });
    }

    // Check for rejected credits
    const rejectedCredits = credits.filter(c => c.status === 'REJECTED');
    if (rejectedCredits.length > 2) {
      suggestions.push({
        category: 'CREDIT_HISTORY',
        priority: 'MEDIUM',
        message: 'Múltiples solicitudes rechazadas',
        impactOnScore: -10,
        action: 'Mejorar perfil antes de solicitar nuevamente',
        timeEstimate: '1-2 semanas',
      });
    }

    return suggestions;
  }

  private calculateCurrentScore(user: User, credits: Credit[]): number {
    let score = 50; // Base score

    // Personal info completeness
    if (user.documentNumber) score += 10;
    if (user.documentType) score += 5;
    if (user.name && user.lastname) score += 10;
    if (user.emailVerified) score += 5;

    // Credit history
    const paidCredits = credits.filter(c => c.status === 'PAID');
    score += Math.min(paidCredits.length * 5, 20); // Max 20 points for paid credits

    // Penalties
    const defaultedCredits = credits.filter(c => c.status === 'DEFAULTED');
    score -= defaultedCredits.length * 15;

    return Math.max(Math.min(score, 100), 0); // Clamp between 0-100
  }

  private calculateProfileCompletion(user: User): number {
    const fields = [
      'email',
      'documentNumber',
      'documentType',
      'name',
      'lastname',
      'emailVerified',
    ];

    const completedFields = fields.filter(field => {
      const value = user[field];
      if (typeof value === 'boolean') return value === true;
      return value !== null && value !== undefined && value !== '';
    });

    return Math.round((completedFields.length / fields.length) * 100);
  }
}
