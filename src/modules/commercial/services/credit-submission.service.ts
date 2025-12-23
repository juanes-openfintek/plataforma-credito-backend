import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ClienteCreacion } from '../entities/cliente-creacion.entity';
import { Credit } from '../../credit/entities/credit.entity';
import { CreditStatus } from '../../credit/interfaces';
import { ValidRoles } from '../../auth/interfaces';

@Injectable()
export class CreditSubmissionService {
  constructor(
    @InjectModel(ClienteCreacion.name)
    private clienteCreacionModel: Model<ClienteCreacion>,
    @InjectModel(Credit.name)
    private creditModel: Model<Credit>,
  ) {}

  /**
   * Convierte un ClienteCreacion completado en un Credit para ser procesado por analistas
   */
  async submitClienteAsCredit(
    clienteId: string,
    commercialUserId: string,
  ): Promise<Credit> {
    const cliente = await this.clienteCreacionModel.findById(clienteId);

    if (!cliente) {
      throw new NotFoundException('Cliente no encontrado');
    }

    if (cliente.status !== 'completado') {
      throw new BadRequestException(
        'El cliente debe estar en estado "completado" para ser radicado',
      );
    }

    const existingCredit = await this.creditModel.findOne({
      documentNumber: cliente.identificationNumber,
      radicationSource: 'COMMERCIAL',
    });

    if (existingCredit) {
      throw new BadRequestException(
        'Este cliente ya fue radicado como crédito',
      );
    }

    // Construir el crédito a partir del cliente
    const credit = new this.creditModel({
      status: CreditStatus.SUBMITTED,
      statusHistory: [
        {
          status: CreditStatus.SUBMITTED,
          changedAt: new Date(),
          changedBy: commercialUserId,
          reason: 'Radicado por comercial',
        },
      ],
      radicationSource: 'COMMERCIAL',
      radicationDate: new Date(),
      user: new Types.ObjectId(commercialUserId),

      // Información del crédito
      amount: cliente.creditAmount || 0,
      quotasNumber: cliente.creditTerm || 12,
      maxDate: this.calculateMaxDate(cliente.creditTerm || 12),
      requiresPortfolioPurchase: cliente['requiresPortfolioPurchase'] || false,
      portfolioDebts: cliente['portfolioDebts'] || [],
      maxQuota: cliente['maxQuota'],
      maxAmount: cliente['maxAmount'],
      desiredQuota: cliente['desiredQuota'],

      // Información personal
      name: cliente.firstName || '',
      secondName: (cliente as any).secondName || '-',
      lastname: cliente.lastName || '',
      secondLastname: (cliente as any).secondLastname || '-',
      phoneNumber: cliente.phone || '',
      dateOfBirth: cliente.birthDate || new Date(),
      documentType: cliente.identificationType || 'CC',
      documentNumber: cliente.identificationNumber || '',
      personType: cliente.personType || 'empleado',

      // Información laboral
      economicActivity: (cliente as any).laborInfo?.occupation || 'No especificado',
      nameCompany: (cliente as any).laborInfo?.company || (cliente as any).laborInfo?.employer || 'No especificado',
      phoneNumberCompany: (cliente as any).laborInfo?.employerPhone || cliente.phone || 'No especificado',
      addressCompany: (cliente as any).laborInfo?.employerAddress || 'No especificado',
      positionCompany: (cliente as any).laborInfo?.position || 'No especificado',
      typeContract: (cliente as any).laborInfo?.contractType || 'Indefinido',
      dateOfAdmission: (cliente as any).laborInfo?.startDate || new Date(),

      // Información de pensión (si aplica)
      pensionIssuer: cliente.pensionIssuer,
      pensionType: cliente.pensionType,

      // Información financiera
      monthlyIncome: String(cliente.monthlyIncome || 0),
      monthlyExpenses: String(cliente.monthlyExpenses || 0),
      experienceCredit: cliente.creditExperience || 'sin-historial',
      disburserMethod: (cliente as any).paymentMethod || 'Transferencia bancaria',

      // Información bancaria para desembolso
      bankName: (cliente as any).financialInfo?.bank || 'No especificado',
      bankAccountType: (cliente as any).financialInfo?.accountType || 'No especificado',
      bankAccountNumber: (cliente as any).financialInfo?.accountNumber || 'No especificado',

      // Referencias personales
      nameReferencePersonal: 'Por validar',
      parentescoReferencePersonal: 'Familiar',
      phoneNumberReferencePersonal: cliente.phone || '',
      departamentReferencePersonal: 'Por validar',
      municipalityReferencePersonal: 'Por validar',

      // Validaciones automáticas
      automaticValidations: {
        kycScore: 0,
        riskCentralsCheck: cliente.riskStatus === 'aprobado',
        debtCapacityRatio: this.calculateDebtRatio(
          cliente.monthlyIncome || 0,
          cliente.monthlyExpenses || 0,
        ),
        blacklistCheck: true,
        fraudScore: 0,
      },

      created: new Date(),
    });

    const savedCredit = await credit.save();

    await this.clienteCreacionModel.findByIdAndUpdate(clienteId, {
      status: 'radicado',
      creditId: savedCredit._id,
    });

    return savedCredit;
  }

  /**
   * Radica múltiples clientes como créditos
   */
  async submitMultipleClientes(
    clienteIds: string[],
    commercialUserId: string,
  ): Promise<{ success: Credit[]; failed: { id: string; error: string }[] }> {
    const success: Credit[] = [];
    const failed: { id: string; error: string }[] = [];

    for (const clienteId of clienteIds) {
      try {
        const credit = await this.submitClienteAsCredit(
          clienteId,
          commercialUserId,
        );
        success.push(credit);
      } catch (error: any) {
        failed.push({
          id: clienteId,
          error: error.message,
        });
      }
    }

    return { success, failed };
  }

  /**
   * Obtiene todos los créditos radicados por un comercial
   */
  async getRadicatedCredits(commercialUserId: string): Promise<Credit[]> {
    return this.creditModel
      .find({
        radicationSource: 'COMMERCIAL',
      })
      .sort({ radicationDate: -1 })
      .exec();
  }

  /**
   * El comercial reenvía el crédito al analista que lo devolvió
   */
  async resendToAnalyst(
    creditId: string,
    commercialUserId: string,
    notes?: string,
    attachments?: Array<{ fileName: string; fileUrl: string; documentType: string }>,
  ): Promise<Credit> {
    const credit = await this.creditModel.findById(creditId);

    if (!credit) {
      throw new NotFoundException('Crédito no encontrado');
    }

    if (credit.user?.toString() !== commercialUserId) {
      throw new BadRequestException('No tiene permiso sobre este crédito');
    }

    if (credit.status !== CreditStatus.COMMERCIAL_RETURNED) {
      throw new BadRequestException(
        'El crédito no está devuelto por analista hacia el comercial',
      );
    }

    const lastReturn = credit.returnHistory?.slice(-1)[0];

    if (!lastReturn || !lastReturn.returnedByRole) {
      throw new BadRequestException(
        'No se pudo identificar el analista que devolvió el crédito',
      );
    }

    const role = lastReturn.returnedByRole as ValidRoles;
    let nextStatus: string;
    if (role === ValidRoles.analyst1) {
      nextStatus = CreditStatus.ANALYST1_VERIFICATION;
    } else if (role === ValidRoles.analyst2) {
      nextStatus = CreditStatus.ANALYST2_VERIFICATION;
    } else if (role === ValidRoles.analyst3) {
      nextStatus = CreditStatus.ANALYST3_VERIFICATION;
    } else {
      throw new BadRequestException('Rol de analista no soportado');
    }

    const now = new Date();

    return this.creditModel.findByIdAndUpdate(
      creditId,
      {
        status: nextStatus,
        $push: {
          returnHistory: {
            returnedBy: commercialUserId,
            returnedByRole: ValidRoles.commercial,
            returnedTo: role,
            reason: notes || 'Información complementada por comercial',
            date: now,
            previousStatus: credit.status,
            attachments: attachments || [],
          },
          statusHistory: {
            status: nextStatus,
            changedAt: now,
            changedBy: commercialUserId,
            reason: notes || 'Crédito reenviado al analista',
          },
        },
      },
      { new: true },
    );
  }

  /**
   * Permite al comercial actualizar datos básicos del crédito devuelto
   */
  async updateCreditFromCommercial(
    creditId: string,
    commercialUserId: string,
    payload: any,
  ): Promise<Credit> {
    const credit = await this.creditModel.findById(creditId);

    if (!credit) {
      throw new NotFoundException('Crédito no encontrado');
    }

    if (credit.user?.toString() !== commercialUserId) {
      throw new BadRequestException('No tiene permiso sobre este crédito');
    }

    if (credit.status !== CreditStatus.COMMERCIAL_RETURNED) {
      throw new BadRequestException(
        'El crédito no está en devolución al comercial',
      );
    }

    const allowedFields = [
      'name',
      'secondName',
      'lastname',
      'secondLastname',
      'documentType',
      'documentNumber',
      'phoneNumber',
      'dateOfBirth',
      'addressCompany',
      'phoneNumberCompany',
      'nameCompany',
      'monthlyIncome',
      'monthlyExpenses',
    ];

    const updates: Record<string, any> = {};
    allowedFields.forEach((field) => {
      if (payload[field] !== undefined) {
        updates[field] = payload[field];
      }
    });

    if (Object.keys(updates).length === 0) {
      throw new BadRequestException('No hay campos válidos para actualizar');
    }

    const now = new Date();

    return this.creditModel.findByIdAndUpdate(
      creditId,
      {
        ...updates,
        $push: {
          statusHistory: {
            status: credit.status,
            changedAt: now,
            changedBy: commercialUserId,
            reason: 'Actualización realizada por comercial en devolución',
          },
        },
      },
      { new: true },
    );
  }

  /**
   * Calcula la fecha máxima del crédito
   */
  private calculateMaxDate(term: number): Date {
    const maxDate = new Date();
    maxDate.setMonth(maxDate.getMonth() + term);
    return maxDate;
  }

  /**
   * Calcula el ratio de deuda
   */
  private calculateDebtRatio(income: number, expenses: number): number {
    if (income === 0) return 1;
    return expenses / income;
  }
}
