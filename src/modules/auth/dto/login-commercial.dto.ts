import { IsString, IsNotEmpty } from 'class-validator';

export class LoginCommercialDto {
  @IsString()
  @IsNotEmpty()
  usuario: string;

  @IsString()
  @IsNotEmpty()
  codigo: string;
}
