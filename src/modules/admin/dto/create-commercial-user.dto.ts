import { IsString, IsNotEmpty, MinLength, IsOptional, IsNumber } from 'class-validator';

export class CreateCommercialUserDto {
  // Credenciales de login
  @IsString()
  @IsNotEmpty()
  usuario: string;

  @IsString()
  @MinLength(8, { message: 'El código debe tener mínimo 8 dígitos' })
  codigo: string;

  // Datos de la empresa
  @IsString()
  @IsNotEmpty()
  companyName: string;

  @IsString()
  @IsNotEmpty()
  registrationNumber: string;

  @IsString()
  @IsNotEmpty()
  taxId: string;

  @IsString()
  @IsNotEmpty()
  businessPhone: string;

  @IsString()
  @IsOptional()
  businessAddress?: string;

  @IsString()
  @IsOptional()
  city?: string;

  @IsString()
  @IsOptional()
  department?: string;

  @IsString()
  @IsNotEmpty()
  legalRepresentativeName: string;

  @IsString()
  @IsOptional()
  legalRepresentativeDocument?: string;

  @IsString()
  @IsOptional()
  businessSector?: string;

  @IsNumber()
  @IsOptional()
  annualRevenue?: number;

  @IsString()
  @IsOptional()
  companyEmail?: string;
}

