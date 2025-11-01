import { IsEmail, IsNotEmpty, IsString, MinLength, IsNumber, IsOptional } from 'class-validator';

export class RegisterCommercialUserDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

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
