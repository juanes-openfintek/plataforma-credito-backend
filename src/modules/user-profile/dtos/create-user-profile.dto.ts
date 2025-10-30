import {
  IsString,
  IsEmail,
  IsPhoneNumber,
  IsDateString,
  IsNumber,
  IsOptional,
  ValidateNested,
  IsArray,
  MinLength,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';

export class AddressDto {
  @IsString()
  street: string;

  @IsString()
  number: string;

  @IsOptional()
  @IsString()
  complement?: string;

  @IsString()
  neighborhood: string;

  @IsString()
  city: string;

  @IsString()
  state: string;

  @IsString()
  zipCode: string;

  @IsString()
  country: string;
}

export class EmploymentDto {
  @IsString()
  employmentType: string; // Empleado, Independiente, Pensionado, Negocio propio

  @IsString()
  companyName: string;

  @IsString()
  position: string;

  @IsNumber()
  monthlyIncome: number;

  @IsDateString()
  startDate: Date;

  @IsOptional()
  @IsDateString()
  endDate?: Date;

  @IsOptional()
  isCurrent?: boolean;
}

export class BankAccountDto {
  @IsString()
  accountHolderName: string;

  @IsString()
  bankName: string;

  @IsString()
  accountType: string; // Ahorros, Corriente

  @IsString()
  @MinLength(10)
  @MaxLength(20)
  accountNumber: string;
}

export class PersonalReferenceDto {
  @IsString()
  name: string;

  @IsString()
  relationship: string;

  @IsString()
  phone: string;

  @IsOptional()
  @IsEmail()
  email?: string;
}

export class CreateUserProfileDto {
  userId: string; // Se obtiene del token

  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsString()
  documentType: string;

  @IsString()
  documentNumber: string;

  @IsDateString()
  dateOfBirth: Date;

  @IsString()
  gender: string;

  @IsString()
  nationality: string;

  @IsEmail()
  email: string;

  @IsString()
  phone: string;

  @IsOptional()
  @IsString()
  alternativePhone?: string;

  @ValidateNested()
  @Type(() => AddressDto)
  address: AddressDto;

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => EmploymentDto)
  @IsArray()
  employmentHistory?: EmploymentDto[];

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => BankAccountDto)
  @IsArray()
  bankAccounts?: BankAccountDto[];

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => PersonalReferenceDto)
  @IsArray()
  personalReferences?: PersonalReferenceDto[];
}

export class UpdateUserProfileDto {
  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  alternativePhone?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => AddressDto)
  address?: AddressDto;

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => EmploymentDto)
  @IsArray()
  employmentHistory?: EmploymentDto[];

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => PersonalReferenceDto)
  @IsArray()
  personalReferences?: PersonalReferenceDto[];
}
