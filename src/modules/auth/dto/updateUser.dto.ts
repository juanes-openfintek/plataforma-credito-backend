import { Exclude } from 'class-transformer';
import {
  IsDate,
  IsEmail,
  IsOptional,
  IsPhoneNumber,
  IsString,
  MinLength,
} from 'class-validator';
import { IsAdult } from '../../../modules/credit/decorators/date.decorator';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  name: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  secondName: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  lastname: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  secondLastname: string;

  @IsOptional()
  @IsString()
  @IsPhoneNumber('CO')
  phoneNumber: string;

  @IsOptional()
  @IsDate() // Asegúrate de que el campo dateOfBirth sea de tipo Date
  @IsAdult()
  dateOfBirth: Date;

  @IsOptional()
  @IsString()
  @MinLength(1)
  documentType: string;

  @IsOptional()
  @IsString()
  documentNumber: string;
}

export class UpdateUserAdminDto extends UpdateUserDto {
  @Exclude()
  email: string;

  @IsString()
  uid: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  role: string;
}
