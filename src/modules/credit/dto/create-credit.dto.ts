import {
  IsDate,
  IsEmail,
  IsOptional,
  IsPhoneNumber,
  IsString,
  Matches,
} from 'class-validator';
import { IsAdult } from '../decorators/date.decorator';
import { Transform } from 'class-transformer';

export class CreateCreditDto {
  @IsEmail()
  email: string;

  @IsString()
  name: string;

  @IsString()
  secondName: string;

  @IsString()
  lastname: string;

  @IsString()
  secondLastname: string;

  @IsPhoneNumber('CO')
  phoneNumber: string;

  @IsDate() // Asegúrate de que el campo dateOfBirth sea de tipo Date
  @Transform(({ value }) => new Date(value))
  @IsAdult()
  dateOfBirth: Date;

  @IsString()
  documentType: string;

  @IsString()
  documentNumber: string;

  // Información de laboral

  @IsString()
  economicActivity: string;

  @IsString()
  nameCompany: string;

  @IsPhoneNumber('CO')
  phoneNumberCompany: string;

  @IsString()
  addressCompany: string;

  @IsString()
  positionCompany: string;

  @IsDate() // Asegúrate de que el campo dateOfAdmission sea de tipo Date
  @Transform(({ value }) => new Date(value))
  dateOfAdmission: Date;

  // Información financiera

  @IsString()
  //Regex para validar que el campo monthlyIncome sea un número entero o decimal
  @Matches(/^[0-9]+(\.[0-9]{1,2})?$/, {
    message: 'El ingreso mensual no es válido',
  })
  monthlyIncome: string;

  @IsString()
  //Regex para validar que el campo monthlyExpenses sea un número entero o decimal
  @Matches(/^[0-9]+(\.[0-9]{1,2})?$/, {
    message: 'El gasto mensual no es válido',
  })
  monthlyExpenses: string;

  @IsString()
  experienceCredit: string;

  @IsString()
  disburserMethod: string;

  // Referencias personales

  @IsString()
  nameReferencePersonal: string;

  @IsString()
  parentescoReferencePersonal: string;

  @IsPhoneNumber('CO')
  phoneNumberReferencePersonal: string;

  @IsString()
  departamentReferencePersonal: string;

  @IsString()
  municipalityReferencePersonal: string;

  // Detalles

  @IsOptional()
  @IsString()
  details: string;

  @IsOptional()
  @IsString()
  taxes: string;
}
