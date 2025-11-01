import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Simulation } from '../entities/simulation.entity';
import { CommercialUser } from '../entities/commercial-user.entity';
import {
  CreateSimulationDto,
  SaveSimulationDto,
  SimulationMode,
} from '../dto/create-simulation.dto';

@Injectable()
export class SimulationService {
  constructor(
    @InjectModel(Simulation.name)
    private simulationModel: Model<Simulation>,
    @InjectModel(CommercialUser.name)
    private commercialUserModel: Model<CommercialUser>,
  ) {}

  /**
   * Calculate credit simulation based on input parameters
   */
  async calculateSimulation(
    commercialUserId: string,
    dto: CreateSimulationDto,
  ): Promise<any> {
    // Verify commercial user exists
    const commercial = await this.commercialUserModel.findOne({
      user: new Types.ObjectId(commercialUserId),
    });

    if (!commercial) {
      throw new NotFoundException('Commercial user not found');
    }

    // Validate brokerage percentage
    if (dto.brokeragePercentage > 70) {
      throw new BadRequestException(
        'El porcentaje de corretaje no puede ser mayor al 70%',
      );
    }

    // Calculate available income (monthly income - deductions)
    const totalDeductions = dto.monthlyDeductions.reduce(
      (sum, deduction) => sum + deduction.amount,
      0,
    );
    const availableIncome = dto.monthlyIncome - totalDeductions;

    // Calculate maximum quota for debt (typically 30-40% of available income)
    const maxDebtQuota = availableIncome * 0.35; // 35% of available income

    // Configuration constants
    const interestRate = 0.015; // 1.5% monthly
    const insuranceRate = 0.006; // 0.6% monthly
    const guaranteeRate = 0.003; // 0.3% monthly (fianzas)
    const administrationRate = 0.005; // 0.5% monthly

    let simulationResult: any;

    if (dto.simulationMode === SimulationMode.BY_QUOTA) {
      // Simulate by desired quota
      const desiredQuota = dto.desiredQuota || maxDebtQuota;
      const desiredTerm = dto.desiredTerm || 36; // Default 36 months

      // Validate quota is within limits
      if (desiredQuota > maxDebtQuota) {
        throw new BadRequestException(
          `La cuota deseada ($${desiredQuota.toLocaleString('es-CO')}) excede la cuota máxima disponible ($${maxDebtQuota.toLocaleString('es-CO')})`,
        );
      }

      // Calculate maximum amount based on quota
      const monthlyRate = interestRate + insuranceRate + guaranteeRate + administrationRate;
      const factor = (monthlyRate * Math.pow(1 + monthlyRate, desiredTerm)) /
        (Math.pow(1 + monthlyRate, desiredTerm) - 1);

      const maxAmount = desiredQuota / factor;
      const brokerageAmount = maxAmount * (dto.brokeragePercentage / 100);
      const netAmount = maxAmount - brokerageAmount;

      // Calculate costs
      const totalInterest = netAmount * interestRate * desiredTerm;
      const totalInsurance = netAmount * insuranceRate * desiredTerm;
      const totalGuarantee = netAmount * guaranteeRate * desiredTerm;
      const totalAdministration = netAmount * administrationRate * desiredTerm;
      const totalIVA = (totalInterest + totalInsurance + totalGuarantee + totalAdministration) * 0.19;
      const totalCost = totalInterest + totalInsurance + totalGuarantee + totalAdministration + totalIVA;

      const finalAmount = netAmount;
      const finalQuota = desiredQuota;
      const finalTerm = desiredTerm;

      // Generate payment plan
      const paymentPlan = this.generatePaymentPlan(
        finalAmount,
        finalTerm,
        interestRate,
        insuranceRate,
        guaranteeRate,
        administrationRate,
        brokerageAmount,
      );

      simulationResult = {
        totalReachableAmount: maxAmount,
        maxDeliverableAmount: netAmount,
        brokerageAmount,
        insuranceAmount: totalInsurance,
        guaranteeAmount: totalGuarantee,
        maxTerm: desiredTerm,
        availableQuota: maxDebtQuota,
        finalQuota,
        finalAmount,
        finalTerm,
        totalCost,
        totalInterest,
        totalInsurance,
        totalGuarantee,
        totalAdministration,
        totalIVA,
        paymentPlan,
      };
    } else {
      // Simulate by desired amount
      const desiredAmount = dto.desiredAmount || 10000000;
      const desiredTerm = dto.desiredTerm || 36;

      // Calculate if quota is within limits
      const monthlyRate = interestRate + insuranceRate + guaranteeRate + administrationRate;
      const factor = (monthlyRate * Math.pow(1 + monthlyRate, desiredTerm)) /
        (Math.pow(1 + monthlyRate, desiredTerm) - 1);

      const requiredQuota = desiredAmount * factor;
      const brokerageAmount = desiredAmount * (dto.brokeragePercentage / 100);
      const netAmount = desiredAmount - brokerageAmount;

      // Validate quota is within limits
      if (requiredQuota > maxDebtQuota) {
        // Calculate maximum amount based on quota
        const maxAmountByQuota = maxDebtQuota / factor;
        throw new BadRequestException(
          `El monto deseado requiere una cuota de $${requiredQuota.toLocaleString('es-CO')}, que excede la cuota máxima disponible ($${maxDebtQuota.toLocaleString('es-CO')}). Monto máximo sugerido: $${maxAmountByQuota.toLocaleString('es-CO')}`,
        );
      }

      // Calculate costs
      const totalInterest = netAmount * interestRate * desiredTerm;
      const totalInsurance = netAmount * insuranceRate * desiredTerm;
      const totalGuarantee = netAmount * guaranteeRate * desiredTerm;
      const totalAdministration = netAmount * administrationRate * desiredTerm;
      const totalIVA = (totalInterest + totalInsurance + totalGuarantee + totalAdministration) * 0.19;
      const totalCost = totalInterest + totalInsurance + totalGuarantee + totalAdministration + totalIVA;

      const finalAmount = netAmount;
      const finalQuota = requiredQuota;
      const finalTerm = desiredTerm;

      // Generate payment plan
      const paymentPlan = this.generatePaymentPlan(
        finalAmount,
        finalTerm,
        interestRate,
        insuranceRate,
        guaranteeRate,
        administrationRate,
        brokerageAmount,
      );

      simulationResult = {
        totalReachableAmount: desiredAmount + brokerageAmount,
        maxDeliverableAmount: netAmount,
        brokerageAmount,
        insuranceAmount: totalInsurance,
        guaranteeAmount: totalGuarantee,
        maxTerm: desiredTerm,
        availableQuota: maxDebtQuota,
        finalQuota,
        finalAmount,
        finalTerm,
        totalCost,
        totalInterest,
        totalInsurance,
        totalGuarantee,
        totalAdministration,
        totalIVA,
        paymentPlan,
      };
    }

    return {
      ...simulationResult,
      input: {
        monthlyIncome: dto.monthlyIncome,
        totalDeductions,
        availableIncome,
        brokeragePercentage: dto.brokeragePercentage,
        activityType: dto.activityType,
        pensionType: dto.pensionType,
        requiresPortfolioPurchase: dto.requiresPortfolioPurchase,
      },
    };
  }

  /**
   * Save a simulation
   */
  async saveSimulation(
    commercialUserId: string,
    dto: SaveSimulationDto,
  ): Promise<Simulation> {
    const commercial = await this.commercialUserModel.findOne({
      user: new Types.ObjectId(commercialUserId),
    });

    if (!commercial) {
      throw new NotFoundException('Commercial user not found');
    }

    // Calculate simulation
    const calculationResult = await this.calculateSimulation(
      commercialUserId,
      dto,
    );

    const simulation = new this.simulationModel({
      commercialUser: commercial._id,
      cliente: dto.clienteId ? new Types.ObjectId(dto.clienteId) : undefined,
      clientName: dto.clientName,
      clientDocument: dto.clientDocument,
      ...dto,
      ...calculationResult,
      status: 'saved',
      notes: dto.notes,
    });

    return await simulation.save();
  }

  /**
   * Get all simulations for a commercial user
   */
  async getSimulations(
    commercialUserId: string,
    status?: string,
  ): Promise<Simulation[]> {
    const commercial = await this.commercialUserModel.findOne({
      user: new Types.ObjectId(commercialUserId),
    });

    if (!commercial) {
      throw new NotFoundException('Commercial user not found');
    }

    const query: any = { commercialUser: commercial._id };
    if (status) {
      query.status = status;
    }

    return await this.simulationModel
      .find(query)
      .sort({ createdAt: -1 })
      .populate('cliente');
  }

  /**
   * Get a specific simulation
   */
  async getSimulationById(
    commercialUserId: string,
    simulationId: string,
  ): Promise<Simulation> {
    const commercial = await this.commercialUserModel.findOne({
      user: new Types.ObjectId(commercialUserId),
    });

    if (!commercial) {
      throw new NotFoundException('Commercial user not found');
    }

    const simulation = await this.simulationModel.findOne({
      _id: new Types.ObjectId(simulationId),
      commercialUser: commercial._id,
    });

    if (!simulation) {
      throw new NotFoundException('Simulation not found');
    }

    return simulation;
  }

  /**
   * Convert simulation to credit (radication)
   */
  async convertToCredit(
    commercialUserId: string,
    simulationId: string,
  ): Promise<any> {
    const simulation = await this.getSimulationById(
      commercialUserId,
      simulationId,
    );

    if (simulation.status === 'converted') {
      throw new BadRequestException('Esta simulación ya fue convertida a crédito');
    }

    // Update simulation status
    simulation.status = 'converted';
    await simulation.save();

    // Return simulation data ready for credit creation
    return {
      simulationId: simulation._id,
      creditAmount: simulation.finalAmount,
      creditTerm: simulation.finalTerm,
      monthlyPayment: simulation.finalQuota,
      simulationData: simulation,
    };
  }

  /**
   * Generate payment plan
   */
  private generatePaymentPlan(
    amount: number,
    term: number,
    interestRate: number,
    insuranceRate: number,
    guaranteeRate: number,
    administrationRate: number,
    brokerageAmount: number,
  ): Array<{
    month: number;
    payment: number;
    principal: number;
    interest: number;
    insurance: number;
    brokerage: number;
    guarantee: number;
    balance: number;
    dueDate: Date;
  }> {
    const paymentPlan = [];
    const monthlyRate = interestRate + insuranceRate + guaranteeRate + administrationRate;
    const factor = (monthlyRate * Math.pow(1 + monthlyRate, term)) /
      (Math.pow(1 + monthlyRate, term) - 1);
    const monthlyPayment = amount * factor;

    let balance = amount;
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() + 1);

    for (let month = 1; month <= term; month++) {
      const interest = balance * interestRate;
      const insurance = amount * insuranceRate; // Fixed on original amount
      const guarantee = amount * guaranteeRate; // Fixed on original amount
      const administration = amount * administrationRate; // Fixed on original amount
      const principal = monthlyPayment - interest - insurance - guarantee - administration;
      balance = Math.max(0, balance - principal);

      const dueDate = new Date(startDate);
      dueDate.setMonth(dueDate.getMonth() + month - 1);

      paymentPlan.push({
        month,
        payment: monthlyPayment,
        principal,
        interest,
        insurance,
        brokerage: month === 1 ? brokerageAmount : 0, // Brokerage only on first payment
        guarantee,
        balance,
        dueDate,
      });
    }

    return paymentPlan;
  }
}

