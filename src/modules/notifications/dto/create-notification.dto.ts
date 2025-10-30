import { IsString, IsNotEmpty, IsOptional, IsEnum, IsDateString } from 'class-validator';

export class CreateNotificationDto {
  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @IsNotEmpty()
  type: string;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  message: string;

  @IsEnum(['LOW', 'NORMAL', 'HIGH', 'URGENT'])
  @IsOptional()
  priority?: string;

  @IsString()
  @IsOptional()
  resourceType?: string;

  @IsString()
  @IsOptional()
  resourceId?: string;

  @IsString()
  @IsOptional()
  actionUrl?: string;

  @IsString()
  @IsOptional()
  actionText?: string;

  @IsString()
  @IsOptional()
  metadata?: string;

  @IsString()
  @IsOptional()
  icon?: string;

  @IsEnum(['CREDIT', 'PAYMENT', 'SYSTEM', 'ACCOUNT', 'SECURITY'])
  @IsOptional()
  category?: string;

  @IsDateString()
  @IsOptional()
  expiresAt?: string;
}
