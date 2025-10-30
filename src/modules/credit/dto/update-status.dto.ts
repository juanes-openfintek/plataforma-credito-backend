import { IsString, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { CreditStatus } from '../schemas/credit-improved.schema';

export class UpdateCreditStatusDto {
  @ApiProperty({
    description: 'New credit status',
    example: 'APPROVED',
    enum: CreditStatus,
  })
  @IsEnum(CreditStatus)
  status: CreditStatus;

  @ApiProperty({
    description: 'Optional reason for status change',
    example: 'Automatic approval based on score and validation',
    required: false,
  })
  @IsString()
  @IsOptional()
  reason?: string;

  @ApiProperty({
    description: 'Optional notes from approver/admin',
    example: 'Customer meets all requirements',
    required: false,
  })
  @IsString()
  @IsOptional()
  notes?: string;
}
