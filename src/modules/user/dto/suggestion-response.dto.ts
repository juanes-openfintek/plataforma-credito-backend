import { ApiProperty } from '@nestjs/swagger';

export class SuggestionItemDto {
  @ApiProperty({
    description: 'Suggestion category',
    example: 'DOCUMENTS',
    enum: ['DOCUMENTS', 'EMPLOYMENT', 'FINANCIAL', 'PERSONAL_INFO', 'CREDIT_HISTORY'],
  })
  category: 'DOCUMENTS' | 'EMPLOYMENT' | 'FINANCIAL' | 'PERSONAL_INFO' | 'CREDIT_HISTORY';

  @ApiProperty({
    description: 'Priority level',
    example: 'HIGH',
    enum: ['HIGH', 'MEDIUM', 'LOW'],
  })
  priority: 'HIGH' | 'MEDIUM' | 'LOW';

  @ApiProperty({
    description: 'Suggestion message',
    example: 'Documentos de identidad no cargados',
  })
  message: string;

  @ApiProperty({
    description: 'Impact on credit score (can be negative)',
    example: -10,
  })
  impactOnScore: number;

  @ApiProperty({
    description: 'Recommended action',
    example: 'Cargar DNI y comprobante de ingresos',
  })
  action: string;

  @ApiProperty({
    description: 'Estimated time to complete action',
    example: '5 minutos',
  })
  timeEstimate: string;
}

export class SuggestionsResponseDto {
  @ApiProperty({
    description: 'List of suggestions',
    type: [SuggestionItemDto],
  })
  suggestions: SuggestionItemDto[];

  @ApiProperty({
    description: 'Total impact on score',
    example: -15,
  })
  totalImpact: number;

  @ApiProperty({
    description: 'Current credit score',
    example: 70,
  })
  currentScore: number;

  @ApiProperty({
    description: 'Potential score if all suggestions are followed',
    example: 85,
  })
  potentialScore: number;

  @ApiProperty({
    description: 'Whether user has incomplete profile',
    example: true,
  })
  hasIncompleteProfile: boolean;

  @ApiProperty({
    description: 'Profile completion percentage',
    example: 75,
  })
  completionPercentage: number;
}
