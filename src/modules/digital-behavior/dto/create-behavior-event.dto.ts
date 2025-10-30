import { IsString, IsNotEmpty, IsOptional, IsEnum, IsNumber } from 'class-validator';

export class CreateBehaviorEventDto {
  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsEnum([
    'LOGIN',
    'LOGOUT',
    'DATA_CHANGE',
    'UPLOAD',
    'CREDIT_REQUEST',
    'CREDIT_VIEW',
    'DOCUMENT_DOWNLOAD',
    'PROFILE_UPDATE',
    'PASSWORD_CHANGE',
    'EMAIL_CHANGE',
    'PHONE_CHANGE',
    'BANK_ACCOUNT_CHANGE',
  ])
  @IsNotEmpty()
  eventType: string;

  @IsString()
  @IsNotEmpty()
  ipAddress: string;

  @IsString()
  @IsNotEmpty()
  deviceInfo: string;

  @IsString()
  @IsOptional()
  browser?: string;

  @IsString()
  @IsOptional()
  operatingSystem?: string;

  @IsString()
  @IsOptional()
  deviceType?: string;

  @IsString()
  @IsOptional()
  location?: string;

  @IsEnum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'])
  @IsOptional()
  riskLevel?: string;

  @IsString()
  @IsOptional()
  riskReason?: string;

  @IsString()
  @IsOptional()
  details?: string;

  @IsString()
  @IsOptional()
  dataChanged?: string;

  @IsString()
  @IsOptional()
  previousValue?: string;

  @IsString()
  @IsOptional()
  newValue?: string;

  @IsString()
  @IsOptional()
  sessionId?: string;

  @IsNumber()
  @IsOptional()
  timeSpent?: number;

  @IsString()
  @IsOptional()
  requestUrl?: string;

  @IsString()
  @IsOptional()
  httpMethod?: string;
}
