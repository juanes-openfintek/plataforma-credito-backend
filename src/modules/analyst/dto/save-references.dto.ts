import { IsString, IsBoolean, IsOptional, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SaveReferencesDto {
  // Referencia Personal
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  personalReferenceVerified?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  personalReferenceConfirmed?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  personalReferenceNotes?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  personalReferenceDate?: string;

  // Referencia Laboral
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  employmentReferenceVerified?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  employmentReferenceConfirmed?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  employmentReferenceNotes?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  employmentReferenceDate?: string;

  // Verificación de ingresos
  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  incomeVerified?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  incomeVerificationNotes?: string;
}

