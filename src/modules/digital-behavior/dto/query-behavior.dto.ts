import { IsString, IsOptional, IsEnum, IsDateString } from 'class-validator';

export class QueryBehaviorDto {
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
  @IsOptional()
  eventType?: string;

  @IsEnum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'])
  @IsOptional()
  riskLevel?: string;

  @IsString()
  @IsOptional()
  ipAddress?: string;

  @IsDateString()
  @IsOptional()
  startDate?: string;

  @IsDateString()
  @IsOptional()
  endDate?: string;

  @IsString()
  @IsOptional()
  page?: string;

  @IsString()
  @IsOptional()
  limit?: string;
}
