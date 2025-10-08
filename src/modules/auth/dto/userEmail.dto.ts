import { IsEmail, IsString } from 'class-validator';

export class UserEmailDto {
  @IsString()
  @IsEmail()
  email: string;
}
