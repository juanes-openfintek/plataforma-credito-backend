import {
  IsDate,
  IsEmail,
  IsNumber,
  IsOptional,
  IsPhoneNumber,
  IsString,
  Matches,
} from 'class-validator';
import { IsAdult } from '../decorators/date.decorator';
import { Transform } from 'class-transformer';

export class GetCredit {
  @IsOptional()
  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  secondName: string;

  @IsOptional()
  @IsString()
  lastname: string;

  @IsOptional()
  @IsString()
  secondLastname: string;

  @IsOptional()
  @IsPhoneNumber('CO')
  phoneNumber: string;

  @IsOptional()
  @IsDate() // Asegúrate de que el campo dateOfBirth sea de tipo Date
  @Transform(({ value }) => new Date(value))
  @IsAdult()
  dateOfBirth: Date;

  @IsOptional()
  @IsString()
  documentType: string;

  @IsOptional()
  @IsString()
  documentNumber: string;

  // Información de laboral

  @IsOptional()
  @IsString()
  economicActivity: string;

  @IsOptional()
  @IsString()
  nameCompany: string;

  @IsOptional()
  @IsPhoneNumber('CO')
  phoneNumberCompany: string;

  @IsOptional()
  @IsString()
  addressCompany: string;

  @IsOptional()
  @IsString()
  positionCompany: string;

  @IsOptional()
  @IsDate() // Asegúrate de que el campo dateOfAdmission sea de tipo Date
  @Transform(({ value }) => new Date(value))
  dateOfAdmission: Date;

  // Información financiera

  @IsOptional()
  @IsString()
  //Regex para validar que el campo monthlyIncome sea un número entero o decimal
  @Matches(/^[0-9]+(\.[0-9]{1,2})?$/, {
    message: 'El ingreso mensual no es válido',
  })
  monthlyIncome: string;

  @IsOptional()
  @IsString()
  //Regex para validar que el campo monthlyExpenses sea un número entero o decimal
  @Matches(/^[0-9]+(\.[0-9]{1,2})?$/, {
    message: 'El gasto mensual no es válido',
  })
  monthlyExpenses: string;

  @IsOptional()
  @IsString()
  experienceCredit: string;

  @IsOptional()
  @IsString()
  disburserMethod: string;

  // Referencias personales

  @IsOptional()
  @IsString()
  nameReferencePersonal: string;

  @IsOptional()
  @IsString()
  parentescoReferencePersonal: string;

  @IsOptional()
  @IsPhoneNumber('CO')
  phoneNumberReferencePersonal: string;

  @IsOptional()
  @IsString()
  departamentReferencePersonal: string;

  @IsOptional()
  @IsString()
  municipalityReferencePersonal: string;

  // Detalles

  @IsOptional()
  @IsString()
  details: string;

  @IsOptional()
  @IsString()
  status: string;

  @IsOptional()
  @IsString()
  taxes: string;

  @IsOptional()
  @IsNumber()
  code: number;
}

export class UpdateCreditsDto {
  @IsString()
  id: string;

  @IsOptional()
  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  secondName: string;

  @IsOptional()
  @IsString()
  lastname: string;

  @IsOptional()
  @IsString()
  secondLastname: string;

  @IsOptional()
  @IsPhoneNumber('CO')
  phoneNumber: string;

  @IsOptional()
  @IsDate() // Asegúrate de que el campo dateOfBirth sea de tipo Date
  @Transform(({ value }) => new Date(value))
  @IsAdult()
  dateOfBirth: Date;

  @IsOptional()
  @IsString()
  documentType: string;

  @IsOptional()
  @IsString()
  documentNumber: string;

  // Información de laboral

  @IsOptional()
  @IsString()
  economicActivity: string;

  @IsOptional()
  @IsString()
  nameCompany: string;

  @IsOptional()
  @IsPhoneNumber('CO')
  phoneNumberCompany: string;

  @IsOptional()
  @IsString()
  addressCompany: string;

  @IsOptional()
  @IsString()
  positionCompany: string;

  @IsOptional()
  @IsDate() // Asegúrate de que el campo dateOfAdmission sea de tipo Date
  @Transform(({ value }) => new Date(value))
  dateOfAdmission: Date;

  // Información financiera

  @IsOptional()
  @IsString()
  //Regex para validar que el campo monthlyIncome sea un número entero o decimal
  @Matches(/^[0-9]+(\.[0-9]{1,2})?$/, {
    message: 'El ingreso mensual no es válido',
  })
  monthlyIncome: string;

  @IsOptional()
  @IsString()
  //Regex para validar que el campo monthlyExpenses sea un número entero o decimal
  @Matches(/^[0-9]+(\.[0-9]{1,2})?$/, {
    message: 'El gasto mensual no es válido',
  })
  monthlyExpenses: string;

  @IsOptional()
  @IsString()
  experienceCredit: string;

  @IsOptional()
  @IsString()
  disburserMethod: string;

  // Referencias personales

  @IsOptional()
  @IsString()
  nameReferencePersonal: string;

  @IsOptional()
  @IsString()
  parentescoReferencePersonal: string;

  @IsOptional()
  @IsPhoneNumber('CO')
  phoneNumberReferencePersonal: string;

  @IsOptional()
  @IsString()
  departamentReferencePersonal: string;

  @IsOptional()
  @IsString()
  municipalityReferencePersonal: string;

  // Detalles

  @IsOptional()
  @IsString()
  details: string;

  @IsOptional()
  @IsString()
  status: string;

  @IsOptional()
  @IsString()
  taxes: string;
}
