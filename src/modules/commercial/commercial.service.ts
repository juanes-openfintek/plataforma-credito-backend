import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CommercialUser } from './entities/commercial-user.entity';
import { ClienteCreacion } from './entities/cliente-creacion.entity';
import { RegisterCommercialUserDto } from './dto/register-commercial.dto';
import { CreateClienteDto, UpdateClienteDto } from './dto/create-cliente.dto';

@Injectable()
export class CommercialService {
  constructor(
    @InjectModel(CommercialUser.name)
    private commercialUserModel: Model<CommercialUser>,
    @InjectModel(ClienteCreacion.name)
    private clienteCreacionModel: Model<ClienteCreacion>,
  ) {}

  /**
   * Create a new commercial user profile
   */
  async createCommercialProfile(
    userId: string,
    dto: RegisterCommercialUserDto,
  ): Promise<CommercialUser> {
    try {
      // Check if commercial user already exists for this user
      const existing = await this.commercialUserModel.findOne({ user: userId });
      if (existing) {
        throw new BadRequestException('This user already has a commercial profile');
      }

      // Check if registration number and tax ID are unique
      const duplicateReg = await this.commercialUserModel.findOne({
        registrationNumber: dto.registrationNumber,
      });
      if (duplicateReg) {
        throw new BadRequestException('Registration number already in use');
      }

      const duplicateTax = await this.commercialUserModel.findOne({
        taxId: dto.taxId,
      });
      if (duplicateTax) {
        throw new BadRequestException('Tax ID already in use');
      }

      const commercialUser = new this.commercialUserModel({
        user: new Types.ObjectId(userId),
        companyName: dto.companyName,
        registrationNumber: dto.registrationNumber,
        taxId: dto.taxId,
        businessPhone: dto.businessPhone,
        businessAddress: dto.businessAddress,
        city: dto.city,
        department: dto.department,
        legalRepresentativeName: dto.legalRepresentativeName,
        legalRepresentativeDocument: dto.legalRepresentativeDocument,
        businessSector: dto.businessSector,
        annualRevenue: dto.annualRevenue,
        companyEmail: dto.companyEmail || dto.companyEmail,
      });

      return await commercialUser.save();
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(`Error creating commercial profile: ${error.message}`);
    }
  }

  /**
   * Get commercial profile by user ID
   */
  async getCommercialProfile(userId: string): Promise<CommercialUser> {
    const commercial = await this.commercialUserModel.findOne({
      user: new Types.ObjectId(userId),
    });

    if (!commercial) {
      throw new NotFoundException('Commercial profile not found');
    }

    return commercial;
  }

  /**
   * Update commercial profile
   */
  async updateCommercialProfile(
    userId: string,
    updateData: Partial<RegisterCommercialUserDto>,
  ): Promise<CommercialUser> {
    const commercial = await this.commercialUserModel.findOneAndUpdate(
      { user: new Types.ObjectId(userId) },
      updateData,
      { new: true },
    );

    if (!commercial) {
      throw new NotFoundException('Commercial profile not found');
    }

    return commercial;
  }

  /**
   * Create a new cliente
   */
  async createCliente(
    commercialUserId: string,
    dto: CreateClienteDto,
  ): Promise<ClienteCreacion> {
    try {
      // Verify commercial user exists
      const commercial = await this.commercialUserModel.findOne({
        user: new Types.ObjectId(commercialUserId),
      });

      if (!commercial) {
        throw new NotFoundException('Commercial user not found');
      }

      // Check if cliente with same ID already exists
      const existing = await this.clienteCreacionModel.findOne({
        identificationNumber: dto.identificationNumber,
        commercialUser: commercial._id,
      });

      if (existing) {
        throw new BadRequestException(
          'A client with this identification number already exists',
        );
      }

      const cliente = new this.clienteCreacionModel({
        commercialUser: commercial._id,
        ...dto,
        status: 'iniciado',
        completionPercentage: calculateCompletion(dto),
      });

      const savedCliente = await cliente.save();

      // Update active clients count
      await this.commercialUserModel.updateOne(
        { _id: commercial._id },
        { $inc: { activeClients: 1 } },
      );

      return savedCliente;
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(`Error creating cliente: ${error.message}`);
    }
  }

  /**
   * Get all clientes for a commercial user
   */
  async getClientesByCommercial(commercialUserId: string): Promise<ClienteCreacion[]> {
    const commercial = await this.commercialUserModel.findOne({
      user: new Types.ObjectId(commercialUserId),
    });

    if (!commercial) {
      throw new NotFoundException('Commercial user not found');
    }

    return await this.clienteCreacionModel.find({
      commercialUser: commercial._id,
    });
  }

  /**
   * Get a specific cliente
   */
  async getClienteById(
    commercialUserId: string,
    clienteId: string,
  ): Promise<ClienteCreacion> {
    const commercial = await this.commercialUserModel.findOne({
      user: new Types.ObjectId(commercialUserId),
    });

    if (!commercial) {
      throw new NotFoundException('Commercial user not found');
    }

    const cliente = await this.clienteCreacionModel.findOne({
      _id: new Types.ObjectId(clienteId),
      commercialUser: commercial._id,
    });

    if (!cliente) {
      throw new NotFoundException('Client not found');
    }

    return cliente;
  }

  /**
   * Update a cliente
   */
  async updateCliente(
    commercialUserId: string,
    clienteId: string,
    updateData: UpdateClienteDto,
  ): Promise<ClienteCreacion> {
    const commercial = await this.commercialUserModel.findOne({
      user: new Types.ObjectId(commercialUserId),
    });

    if (!commercial) {
      throw new NotFoundException('Commercial user not found');
    }

    const cliente = await this.clienteCreacionModel.findOneAndUpdate(
      { _id: new Types.ObjectId(clienteId), commercialUser: commercial._id },
      {
        ...updateData,
        completionPercentage: updateData.completionPercentage || 0,
      },
      { new: true },
    );

    if (!cliente) {
      throw new NotFoundException('Client not found');
    }

    // Update commercial user stats if status changed
    if (updateData.status === 'aprobado') {
      await this.commercialUserModel.updateOne(
        { _id: commercial._id },
        { $inc: { approvedCredits: 1 } },
      );
    }

    if (updateData.status === 'desembolsado' && cliente.creditAmount) {
      await this.commercialUserModel.updateOne(
        { _id: commercial._id },
        { $inc: { disbursedAmount: cliente.creditAmount } },
      );
    }

    return cliente;
  }

  /**
   * Delete a cliente
   */
  async deleteCliente(commercialUserId: string, clienteId: string): Promise<void> {
    const commercial = await this.commercialUserModel.findOne({
      user: new Types.ObjectId(commercialUserId),
    });

    if (!commercial) {
      throw new NotFoundException('Commercial user not found');
    }

    const result = await this.clienteCreacionModel.deleteOne({
      _id: new Types.ObjectId(clienteId),
      commercialUser: commercial._id,
    });

    if (result.deletedCount === 0) {
      throw new NotFoundException('Client not found');
    }

    // Decrement active clients count
    await this.commercialUserModel.updateOne(
      { _id: commercial._id },
      { $inc: { activeClients: -1 } },
    );
  }

  /**
   * Get clients by status
   */
  async getClientesByStatus(
    commercialUserId: string,
    status: string,
  ): Promise<ClienteCreacion[]> {
    const commercial = await this.commercialUserModel.findOne({
      user: new Types.ObjectId(commercialUserId),
    });

    if (!commercial) {
      throw new NotFoundException('Commercial user not found');
    }

    return await this.clienteCreacionModel.find({
      commercialUser: commercial._id,
      status,
    });
  }

  /**
   * Get commercial statistics
   */
  async getCommercialStats(commercialUserId: string) {
    const commercial = await this.commercialUserModel.findOne({
      user: new Types.ObjectId(commercialUserId),
    });

    if (!commercial) {
      throw new NotFoundException('Commercial user not found');
    }

    const clientes = await this.clienteCreacionModel.find({
      commercialUser: commercial._id,
    });

    const statusCounts = {
      iniciado: clientes.filter((c) => c.status === 'iniciado').length,
      'en-progreso': clientes.filter((c) => c.status === 'en-progreso').length,
      completado: clientes.filter((c) => c.status === 'completado').length,
      aprobado: clientes.filter((c) => c.status === 'aprobado').length,
      rechazado: clientes.filter((c) => c.status === 'rechazado').length,
      desembolsado: clientes.filter((c) => c.status === 'desembolsado').length,
      radicados: clientes.filter((c) => ['iniciado', 'en-progreso', 'completado'].includes(c.status)).length,
    };

    const totalAmount = clientes.reduce((sum, c) => sum + (c.creditAmount || 0), 0);

    return {
      totalClients: clientes.length,
      statusBreakdown: statusCounts,
      totalCreditRequested: totalAmount,
      approvedCredits: commercial.approvedCredits,
      disbursedAmount: commercial.disbursedAmount,
      activeClients: commercial.activeClients,
      tier: commercial.tier,
      commissionPercentage: commercial.commissionPercentage,
    };
  }
}

/**
 * Helper function to calculate completion percentage
 */
function calculateCompletion(dto: CreateClienteDto): number {
  let completed = 0;
  let total = 9;

  if (dto.identificationType && dto.identificationNumber && dto.phone) completed++;
  if (dto.pensionIssuer && dto.pensionType) completed++;
  if (dto.firstName && dto.lastName && dto.birthDate && dto.email) completed++;
  if (dto.monthlyIncome && dto.monthlyExpenses && dto.creditExperience) completed++;
  if (dto.creditAmount && dto.creditTerm) completed++;
  if (dto.documents && dto.documents.length > 0) completed++;
  if (dto.healthStatus && dto.disability) completed++;
  if (dto.laborInfo && dto.financialDetails) completed++;

  return Math.round((completed / total) * 100);
}
