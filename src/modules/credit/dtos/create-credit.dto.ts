import { IsString, IsNumber, IsDateString, IsOptional, Min, Max } from 'class-validator';

export class CreateCreditDto {
  @IsString()
  creditTypeId: string;

  @IsNumber()
  @Min(100)
  requestedAmount: number;

  @IsNumber()
  @Min(1)
  @Max(360)
  term: number; // En meses
}

export class SubmitCreditDto {
  @IsOptional()
  @IsString()
  creditNumber?: string;

  // Documentos a subir se manejan por separado con FormData
}

export class SimulateCreditDto {
  @IsNumber()
  @Min(100)
  principal: number;

  @IsNumber()
  @Min(0.1)
  @Max(100)
  annualInterestRate: number;

  @IsNumber()
  @Min(1)
  @Max(360)
  termInMonths: number;
}

export class ApproveCreditDto {
  @IsNumber()
  @Min(100)
  approvedAmount: number;

  @IsNumber()
  @Min(0.1)
  @Max(100)
  interestRate: number;

  @IsOptional()
  @IsString()
  approvalNotes?: string;
}

export class RejectCreditDto {
  @IsString()
  rejectionReason: string;
}

export class DisburseCreditDto {
  @IsString()
  disburseMethod: string; // Transferencia, Efectivo, Depósito

  @IsString()
  bankAccountId?: string; // Opcional si es transferencia

  @IsOptional()
  @IsString()
  disburseVoucher?: string; // URL del comprobante
}

export class RecordPaymentDto {
  @IsNumber()
  @Min(0.01)
  amount: number;

  @IsDateString()
  paymentDate: Date;

  @IsOptional()
  @IsString()
  voucher?: string;
}
