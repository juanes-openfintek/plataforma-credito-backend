import { IsString, IsEnum, IsOptional, IsObject } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum CreditAction {
  APPROVE = 'approve',
  REJECT = 'reject',
  RETURN = 'return',
}

export enum CreditReturnTarget {
  PREVIOUS = 'previous',
  COMMERCIAL = 'commercial',
}

export class ProcessCreditDto {
  @ApiProperty({
    description: 'Action to perform on the credit',
    example: 'approve',
    enum: CreditAction,
  })
  @IsEnum(CreditAction)
  action: CreditAction;

  @ApiProperty({
    description: 'Notes or comments from the analyst',
    example: 'All validations passed successfully',
    required: false,
  })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiProperty({
    description: 'Reason for rejection or return',
    example: 'Incomplete documentation',
    required: false,
  })
  @IsString()
  @IsOptional()
  reason?: string;

  @ApiProperty({
    description: 'Destino de la devolución (por defecto: previous)',
    example: 'commercial',
    required: false,
    enum: CreditReturnTarget,
  })
  @IsString()
  @IsOptional()
  returnTo?: CreditReturnTarget;

  @ApiProperty({
    description: 'Updated credit data (if editing)',
    required: false,
  })
  @IsObject()
  @IsOptional()
  creditData?: any;

  @ApiProperty({
    description: 'Reference information (for analyst 2)',
    required: false,
  })
  @IsObject()
  @IsOptional()
  references?: {
    personalReferenceVerified?: boolean;
    personalReferenceNotes?: string;
    laboralReferenceVerified?: boolean;
    laboralReferenceNotes?: string;
    commercialReferenceVerified?: boolean;
    commercialReferenceNotes?: string;
  };

  @ApiProperty({
    description: 'Document validation (for analyst 3)',
    required: false,
  })
  @IsObject()
  @IsOptional()
  documents?: {
    documentType: string;
    status: 'accepted' | 'rejected' | 'pending';
    notes?: string;
  }[];
}
