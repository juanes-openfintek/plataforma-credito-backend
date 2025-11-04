import { IsString, IsNotEmpty, Length, Matches } from 'class-validator';

export class GenerateOtpDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/^[0-9]{10}$/, {
    message: 'El número de teléfono debe tener 10 dígitos',
  })
  phone: string;
}

export class VerifyOtpDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/^[0-9]{10}$/, {
    message: 'El número de teléfono debe tener 10 dígitos',
  })
  phone: string;

  @IsString()
  @IsNotEmpty()
  @Length(4, 4, {
    message: 'El código OTP debe tener 4 dígitos',
  })
  otp: string;
}

