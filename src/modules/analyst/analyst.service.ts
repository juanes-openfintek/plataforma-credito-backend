import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Credit } from '../credit/entities/credit.entity';
import {
  ProcessCreditDto,
  CreditAction,
  CreditReturnTarget,
} from './dto/process-credit.dto';
import { UpdateCreditDataDto } from './dto/update-credit-data.dto';
import { ValidationEngineService } from './services/validation-engine.service';
import { CreditStatus } from '../credit/interfaces';
import { ValidRoles } from '../auth/interfaces';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class AnalystService {
  private readonly logger = new Logger(AnalystService.name);

  constructor(
    @InjectModel(Credit.name)
    private readonly creditModel: Model<Credit>,
    private readonly validationEngine: ValidationEngineService,
    private readonly notificationsService: NotificationsService,
  ) {}

  /**
   * Obtiene créditos pendientes para un nivel de analista específico
   */
  async getCreditsForAnalyst(
    analystLevel: 1 | 2 | 3,
    filters?: any,
  ): Promise<Credit[]> {
    const statusMap: Record<1 | 2 | 3, string[]> = {
      1: [
        CreditStatus.SUBMITTED,
        CreditStatus.ANALYST1_REVIEW,
        CreditStatus.ANALYST1_RETURNED,
        CreditStatus.ANALYST2_RETURNED,
        CreditStatus.ANALYST1_VERIFICATION,
      ],
      2: [
        CreditStatus.ANALYST1_APPROVED,
        CreditStatus.ANALYST2_REVIEW,
        CreditStatus.ANALYST2_RETURNED,
        CreditStatus.ANALYST3_RETURNED,
        CreditStatus.ANALYST2_VERIFICATION,
      ],
      3: [
        CreditStatus.ANALYST2_APPROVED,
        CreditStatus.ANALYST3_REVIEW,
        CreditStatus.ANALYST3_RETURNED,
        CreditStatus.ANALYST3_APPROVED,
        CreditStatus.PENDING_SIGNATURE,
        CreditStatus.READY_TO_DISBURSE,
        CreditStatus.ANALYST3_VERIFICATION,
      ],
    };

    const query: any = {
      status: {
        $in: [
          ...statusMap[analystLevel],
          // Legacy statuses so old credits still appear
          CreditStatus.pending,
          CreditStatus.approved,
          CreditStatus.disbursed,
          CreditStatus.rejected,
        ],
      },
    };

    if (filters?.search) {
      query.$or = [
        { name: { $regex: filters.search, $options: 'i' } },
        { lastname: { $regex: filters.search, $options: 'i' } },
        { documentNumber: { $regex: filters.search, $options: 'i' } },
        { radicationNumber: { $regex: filters.search, $options: 'i' } },
      ];
    }

    const credits = await this.creditModel
      .find(query)
      .populate('user')
      .populate('taxes')
      .populate('account')
      .sort({ created: -1 })
      .lean()
      .exec();

    // Normalizar estados legacy para que el frontend siempre reciba los nuevos valores
    return credits
      .map((credit: any) => ({
        ...credit,
        status: this.normalizeStatus(credit.status as string),
      }))
      .filter((credit: any) =>
        statusMap[analystLevel].includes(credit.status as any),
      );
  }

  /**
   * Obtiene un crédito específico por ID
   */
  async getCreditById(id: string): Promise<Credit> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid credit ID format');
    }

    const credit = await this.creditModel
      .findById(id)
      .populate('user')
      .populate('taxes')
      .populate('account')
      .exec();

    if (!credit) {
      throw new NotFoundException(`Credit with ID ${id} not found`);
    }

    // Normalizar estado legacy en lectura
    credit.status = this.normalizeStatus(credit.status as any) as any;

    return credit;
  }

  /**
   * Procesa un crédito (aprobar, rechazar o devolver)
   */
  async processCredit(
    creditId: string,
    userId: string,
    userRole: ValidRoles,
    processDto: ProcessCreditDto,
  ): Promise<Credit> {
    const credit = await this.getCreditById(creditId);

    // Verificar que el analista tiene permiso para procesar este crédito
    this.validateAnalystPermission(credit, userRole);

    switch (processDto.action) {
      case CreditAction.APPROVE:
        return this.approveCredit(credit, userId, userRole, processDto);
      case CreditAction.REJECT:
        return this.rejectCredit(credit, userId, userRole, processDto);
      case CreditAction.RETURN:
        return this.returnCredit(credit, userId, userRole, processDto);
      default:
        throw new BadRequestException('Invalid action');
    }
  }

  /**
   * Aprueba un crédito y lo mueve a la siguiente etapa
   */
  private async approveCredit(
    credit: Credit,
    userId: string,
    userRole: ValidRoles,
    processDto: ProcessCreditDto,
  ): Promise<Credit> {
    const updates: any = {};
    const now = new Date();

    if (userRole === ValidRoles.analyst1) {
      updates.status = CreditStatus.ANALYST1_APPROVED;
      updates.analyst1Id = userId;
      updates.analyst1ReviewDate = now;
      updates.analyst1Notes = processDto.notes || '';
    } else if (userRole === ValidRoles.analyst2) {
      updates.status = CreditStatus.ANALYST2_APPROVED;
      updates.analyst2Id = userId;
      updates.analyst2ReviewDate = now;
      updates.analyst2Notes = processDto.notes || '';

      // Guardar información de referencias si se proporciona
      if (processDto.references) {
        updates.references = processDto.references;
      }
    } else if (userRole === ValidRoles.analyst3) {
      updates.status = CreditStatus.ANALYST3_APPROVED;
      updates.analyst3Id = userId;
      updates.analyst3ReviewDate = now;
      updates.analyst3Notes = processDto.notes || '';
    }

    // Agregar al historial de estados
    if (!credit['statusHistory']) {
      updates.$push = { statusHistory: [] };
    }

    const updatedCredit = await this.creditModel.findByIdAndUpdate(
      (credit as any)._id,
      {
        ...updates,
        $push: {
          statusHistory: {
            status: updates.status,
            changedAt: now,
            changedBy: userId,
            reason: processDto.notes || `Approved by ${userRole}`,
          },
        },
      },
      { new: true },
    );

    return updatedCredit;
  }

  /**
   * Rechaza un crédito
   */
  private async rejectCredit(
    credit: Credit,
    userId: string,
    userRole: ValidRoles,
    processDto: ProcessCreditDto,
  ): Promise<Credit> {
    if (!processDto.reason) {
      throw new BadRequestException('Reason is required for rejection');
    }

    const now = new Date();
    const updates: any = {
      status: CreditStatus.REJECTED,
      details: processDto.reason,
    };

    // Registrar cuál analista rechazó
    if (userRole === ValidRoles.analyst1) {
      updates.analyst1Id = userId;
      updates.analyst1ReviewDate = now;
      updates.analyst1Notes = `REJECTED: ${processDto.reason}`;
    } else if (userRole === ValidRoles.analyst2) {
      updates.analyst2Id = userId;
      updates.analyst2ReviewDate = now;
      updates.analyst2Notes = `REJECTED: ${processDto.reason}`;
    } else if (userRole === ValidRoles.analyst3) {
      updates.analyst3Id = userId;
      updates.analyst3ReviewDate = now;
      updates.analyst3Notes = `REJECTED: ${processDto.reason}`;
    }

    const updatedCredit = await this.creditModel.findByIdAndUpdate(
      (credit as any)._id,
      {
        ...updates,
        $push: {
          statusHistory: {
            status: CreditStatus.REJECTED,
            changedAt: now,
            changedBy: userId,
            reason: processDto.reason,
          },
        },
      },
      { new: true },
    );

    return updatedCredit;
  }

  /**
   * Devuelve un crédito a la etapa anterior
   */
  private async returnCredit(
    credit: Credit,
    userId: string,
    userRole: ValidRoles,
    processDto: ProcessCreditDto,
  ): Promise<Credit> {
    if (!processDto.reason) {
      throw new BadRequestException('Reason is required for return');
    }

    const now = new Date();
    let newStatus: string;
    let returnedTo: string;

    if (processDto.returnTo === CreditReturnTarget.COMMERCIAL) {
      newStatus = CreditStatus.COMMERCIAL_RETURNED;
      returnedTo = 'commercial';
    } else if (userRole === ValidRoles.analyst1) {
      newStatus = CreditStatus.ANALYST1_RETURNED;
      returnedTo = 'user';
    } else if (userRole === ValidRoles.analyst2) {
      newStatus = CreditStatus.ANALYST2_RETURNED;
      returnedTo = 'analyst1';
    } else if (userRole === ValidRoles.analyst3) {
      newStatus = CreditStatus.ANALYST3_RETURNED;
      returnedTo = 'analyst2';
    } else {
      throw new BadRequestException('Invalid analyst role for return');
    }

    const updatedCredit = await this.creditModel.findByIdAndUpdate(
      (credit as any)._id,
      {
        status: newStatus,
        $push: {
          returnHistory: {
            returnedBy: userId,
            returnedByRole: userRole,
            returnedTo,
            reason: processDto.reason,
            date: now,
            previousStatus: credit.status,
          },
          statusHistory: {
            status: newStatus,
            changedAt: now,
            changedBy: userId,
            reason:
              newStatus === CreditStatus.COMMERCIAL_RETURNED
                ? `Devuelto al comercial: ${processDto.reason}`
                : `Returned: ${processDto.reason}`,
          },
        },
      },
      { new: true },
    );

    if (newStatus === CreditStatus.COMMERCIAL_RETURNED) {
      try {
        await this.notificationsService.create({
          userId: credit.user?.toString?.() || '',
          type: 'CREDIT_RETURNED',
          title: 'Crédito devuelto por analista',
          message:
            processDto.reason ||
            'El analista solicitó información adicional del crédito.',
          priority: 'HIGH',
          category: 'CREDIT',
          resourceType: 'CREDIT',
          resourceId: credit['_id']?.toString?.(),
          actionUrl: `/comercial/radicados/${(credit as any)._id}`,
          actionText: 'Revisar devolución',
          icon: '📩',
        });
      } catch (error) {
        this.logger.error(
          `No se pudo enviar notificación al comercial: ${error?.message}`,
        );
      }
    }

    return updatedCredit;
  }

  /**
   * Actualiza los datos de un crédito
   */
  async updateCreditData(
    creditId: string,
    userId: string,
    userRole: ValidRoles,
    updateDto: UpdateCreditDataDto,
  ): Promise<Credit> {
    const credit = await this.getCreditById(creditId);

    // Verificar permisos
    this.validateAnalystPermission(credit, userRole);

    const updatedCredit = await this.creditModel.findByIdAndUpdate(
      creditId,
      { ...updateDto },
      { new: true },
    );

    return updatedCredit;
  }

  /**
   * Obtiene las validaciones automáticas para un crédito
   */
  async getAutomaticValidations(creditId: string) {
    const credit = await this.getCreditById(creditId);

    // Ejecutar validaciones (siempre recalcular para tener data actualizada)
    const validationResult =
      await this.validationEngine.runAutomaticValidations(credit);

    // Guardar validaciones en el crédito para futuras referencias
    await this.creditModel.findByIdAndUpdate(creditId, {
      automaticValidations: validationResult.details,
    });

    return validationResult;
  }

  /**
   * Agrega un comentario al crédito
   */
  async addComment(
    creditId: string,
    userId: string,
    comment: string,
  ): Promise<Credit> {
    const credit = await this.getCreditById(creditId);

    const updatedCredit = await this.creditModel.findByIdAndUpdate(
      creditId,
      {
        $push: {
          comments: {
            comment,
            addedBy: userId,
            addedAt: new Date(),
          },
        },
      },
      { new: true },
    );

    return updatedCredit;
  }

  /**
   * Genera link de firma electrónica (Analyst 3 only)
   */
  async generateSignatureLink(
    creditId: string,
    userId: string,
    userRole: ValidRoles,
  ): Promise<{ link: string; credit: Credit }> {
    if (userRole !== ValidRoles.analyst3) {
      throw new ForbiddenException(
        'Only Analyst 3 can generate signature links',
      );
    }

    const credit = await this.getCreditById(creditId);

    if (credit.status !== CreditStatus.ANALYST3_APPROVED) {
      throw new BadRequestException(
        'Credit must be approved by Analyst 3 before generating signature link',
      );
    }

    // Generar link (simulado)
    const signatureLink = `https://firma.plataforma.com/sign/${creditId}`;

    // Actualizar estado
    const updatedCredit = await this.creditModel.findByIdAndUpdate(
      creditId,
      {
        status: CreditStatus.PENDING_SIGNATURE,
        signatureLink,
        $push: {
          statusHistory: {
            status: CreditStatus.PENDING_SIGNATURE,
            changedAt: new Date(),
            changedBy: userId,
            reason: 'Signature link generated',
          },
        },
      },
      { new: true },
    );

    return {
      link: signatureLink,
      credit: updatedCredit,
    };
  }

  /**
   * Confirma el desembolso (Analyst 3 only)
   */
  async confirmDisburse(
    creditId: string,
    userId: string,
    userRole: ValidRoles,
    disburseData?: any,
  ): Promise<Credit> {
    if (userRole !== ValidRoles.analyst3) {
      throw new ForbiddenException('Only Analyst 3 can confirm disburse');
    }

    const credit = await this.getCreditById(creditId);

    // Debe estar pendiente de firma o ya firmado
    if (
      credit.status !== CreditStatus.PENDING_SIGNATURE &&
      credit.status !== CreditStatus.ANALYST3_APPROVED
    ) {
      throw new BadRequestException(
        'Credit must be signed before confirming disburse',
      );
    }

    const updatedCredit = await this.creditModel.findByIdAndUpdate(
      creditId,
      {
        status: CreditStatus.READY_TO_DISBURSE,
        disburseData,
        $push: {
          statusHistory: {
            status: CreditStatus.READY_TO_DISBURSE,
            changedAt: new Date(),
            changedBy: userId,
            reason: 'Ready for disbursement',
          },
        },
      },
      { new: true },
    );

    return updatedCredit;
  }

  /**
   * Valida que el analista tenga permiso para procesar el crédito
   */
  private validateAnalystPermission(
    credit: Credit,
    userRole: ValidRoles,
  ): void {
    const validStatusMap = {
      [ValidRoles.analyst1]: [
        CreditStatus.SUBMITTED,
        CreditStatus.ANALYST1_REVIEW,
        CreditStatus.ANALYST2_RETURNED,
      ],
      [ValidRoles.analyst2]: [
        CreditStatus.ANALYST1_APPROVED,
        CreditStatus.ANALYST2_REVIEW,
        CreditStatus.ANALYST3_RETURNED,
      ],
      [ValidRoles.analyst3]: [
        CreditStatus.ANALYST2_APPROVED,
        CreditStatus.ANALYST3_REVIEW,
        CreditStatus.PENDING_SIGNATURE,
      ],
    };

    const currentStatus = this.normalizeStatus(credit.status as any) as any;
    const validStatuses = validStatusMap[userRole];

    if (!validStatuses || !validStatuses.includes(currentStatus as any)) {
      throw new ForbiddenException(
        `Analyst cannot process credit in status: ${credit.status}`,
      );
    }
  }

  /**
   * Mapea estados legacy a los estados nuevos para evitar que se pierdan en las consultas.
   */
  private normalizeStatus(status: string): string {
    const legacyMap: Record<string, string> = {
      [CreditStatus.pending]: CreditStatus.SUBMITTED,
      [CreditStatus.approved]: CreditStatus.ANALYST3_APPROVED,
      [CreditStatus.disbursed]: CreditStatus.DISBURSED,
      [CreditStatus.rejected]: CreditStatus.REJECTED,
    };

    return legacyMap[status] || status;
  }
}
