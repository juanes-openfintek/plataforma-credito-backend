import {
  IsString,
  IsNumber,
  IsBoolean,
  IsOptional,
  IsEnum,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export enum ActivityType {
  PENSIONADO = 'pensionado',
  EMPLEADO = 'empleado',
  INDEPENDIENTE = 'independiente',
}

export enum PensionType {
  PROPIA_VEJEZ = 'propia-vejez',
  SOBREVIVIENTE = 'sobreviviente',
  INVALIDEZ = 'invalidez',
  OTRA = 'otra',
}

export enum SimulationMode {
  BY_AMOUNT = 'by-amount',
  BY_QUOTA = 'by-quota',
}

export class MonthlyDeductionDto {
  @IsNumber()
  amount: number;

  @IsString()
  description: string;
}

export class CreateSimulationDto {
  // Preguntas iniciales
  @IsBoolean()
  requiresPortfolioPurchase: boolean; // ¿Requiere compra de cartera?

  @IsEnum(PensionType)
  @IsOptional()
  pensionType?: PensionType; // Tipo de pensión

  // Selección de producto
  @IsNumber()
  brokeragePercentage: number; // Porcentaje de corretaje (máximo 70%)

  @IsEnum(ActivityType)
  activityType: ActivityType; // Tipo de actividad

  // Ingresos y descuentos
  @IsNumber()
  monthlyIncome: number; // Ingresos mensuales

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MonthlyDeductionDto)
  monthlyDeductions: MonthlyDeductionDto[]; // Descuentos mensuales

  // Modo de simulación
  @IsEnum(SimulationMode)
  simulationMode: SimulationMode; // Por cuota o por monto

  // Si es por monto
  @IsNumber()
  @IsOptional()
  desiredAmount?: number; // Monto deseado

  // Si es por cuota
  @IsNumber()
  @IsOptional()
  desiredQuota?: number; // Cuota deseada

  @IsNumber()
  @IsOptional()
  desiredTerm?: number; // Plazo deseado en meses

  // Información adicional del cliente (opcional, puede venir del flujo anterior)
  @IsString()
  @IsOptional()
  clienteId?: string; // ID del cliente si ya existe
}

export class SaveSimulationDto extends CreateSimulationDto {
  @IsString()
  @IsOptional()
  clientName?: string;

  @IsString()
  @IsOptional()
  clientDocument?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}

