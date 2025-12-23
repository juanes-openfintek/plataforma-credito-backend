import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  Put,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { ApprovalEngineService } from '../analyst/services/approval-engine.service';
import { CreditService } from './credit.service';
import { EvaluateCreditDto } from './dto/evaluate-credit.dto';
import { ApprovalResponseDto } from './dto/approval-response.dto';
import { UpdateCreditStatusDto } from './dto/update-status.dto';
import { ValidRoles } from '../auth/interfaces';
import { Auth, GetUser } from '../auth/decorators';
import { User } from '../auth/entities/user.entity';
import { CreditStatus } from './schemas/credit-improved.schema';
import { AuditService } from '../audit/audit.service';
import { NotificationsService } from '../notifications/notifications.service';

@ApiTags('Credit Approval')
@Controller('credit')
export class CreditApprovalController {
  constructor(
    private readonly approvalEngine: ApprovalEngineService,
    private readonly creditService: CreditService,
    private readonly auditService: AuditService,
    private readonly notificationsService: NotificationsService,
  ) {}

  @Post('evaluate')
  @Auth() // Cualquier usuario autenticado puede evaluar
  @ApiOperation({
    summary: 'Evaluate credit for approval',
    description:
      'Evaluates a credit request against approval rules to determine if it can be auto-approved and what level of approval is required',
  })
  @ApiResponse({
    status: 200,
    description: 'Credit evaluation completed successfully',
    type: ApprovalResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid credit evaluation data',
  })
  async evaluateCredit(
    @Body() evaluateDto: EvaluateCreditDto,
  ): Promise<ApprovalResponseDto> {
    const {
      creditAmount,
      creditTerm,
      userScore,
      monthlyIncome,
      currentMonthlyDebt,
      employmentMonths,
      creditHistoryMonths,
      requiredDocumentsVerified,
      creditType = 'PERSONAL',
    } = evaluateDto;

    // Get approval rules
    const rules = this.approvalEngine.getApprovalRules();

    // Build approval context
    const context = {
      creditAmount,
      creditTerm,
      userScore,
      monthlyIncome,
      currentMonthlyDebt,
      employmentMonths,
      creditHistoryMonths,
      requiredDocumentsVerified,
    };

    // Evaluate auto-approval
    const canAutoApprove = this.approvalEngine.canAutoApprove(context);

    // Get required approval level
    const approvalLevel =
      this.approvalEngine.getRequiredApprovalLevel(creditAmount);

    // Get expected days
    const expectedApprovalDays =
      this.approvalEngine.getExpectedApprovalDays(approvalLevel);

    // Get required documents
    const requiredDocuments =
      this.approvalEngine.getRequiredDocuments(creditType);

    // Build validations
    const debtToIncomeRatio = currentMonthlyDebt / monthlyIncome;
    const rejectionReasons: string[] = [];

    const scoreValidation = {
      passed: userScore >= rules.scoreThreshold,
      score: userScore,
      threshold: rules.scoreThreshold,
    };
    if (!scoreValidation.passed) {
      rejectionReasons.push(
        `Credit score ${userScore} is below minimum threshold of ${rules.scoreThreshold}`,
      );
    }

    const incomeValidation = {
      passed: monthlyIncome >= (rules.minimumMonthlyIncome || 0),
      income: monthlyIncome,
      minimum: rules.minimumMonthlyIncome || 0,
    };
    if (!incomeValidation.passed) {
      rejectionReasons.push(
        `Monthly income $${monthlyIncome} is below minimum required $${rules.minimumMonthlyIncome}`,
      );
    }

    const debtRatioValidation = {
      passed: debtToIncomeRatio <= (rules.maximumDebtToIncomeRatio || 1),
      ratio: debtToIncomeRatio,
      maximum: rules.maximumDebtToIncomeRatio || 1,
    };
    if (!debtRatioValidation.passed) {
      rejectionReasons.push(
        `Debt-to-income ratio ${(debtToIncomeRatio * 100).toFixed(1)}% exceeds maximum ${((rules.maximumDebtToIncomeRatio || 1) * 100).toFixed(1)}%`,
      );
    }

    const documentValidation = {
      passed: requiredDocumentsVerified,
      verified: requiredDocumentsVerified,
    };
    if (!documentValidation.passed) {
      rejectionReasons.push('Not all required documents are verified');
    }

    const amountValidation = {
      passed: canAutoApprove
        ? creditAmount <= rules.autoApproveUpTo
        : creditAmount > 0,
      amount: creditAmount,
      autoApproveLimit: rules.autoApproveUpTo,
    };
    if (!amountValidation.passed && canAutoApprove) {
      rejectionReasons.push(
        `Credit amount $${creditAmount} exceeds auto-approval limit of $${rules.autoApproveUpTo}`,
      );
    }

    // Build recommendation
    let recommendation = '';
    if (canAutoApprove) {
      recommendation = `This credit qualifies for automatic approval. Expected processing time: ${expectedApprovalDays} business days.`;
    } else if (rejectionReasons.length > 0) {
      recommendation = `This credit does not qualify for automatic approval. Please address the following issues: ${rejectionReasons.join('; ')}.`;
    } else {
      recommendation = `This credit requires ${approvalLevel} level approval. Expected processing time: ${expectedApprovalDays} business days.`;
    }

    return {
      canAutoApprove,
      approvalLevel,
      expectedApprovalDays,
      rejectionReasons,
      validations: {
        scoreValidation,
        incomeValidation,
        debtRatioValidation,
        documentValidation,
        amountValidation,
      },
      requiredDocuments,
      approvalRules: rules,
      recommendation,
    };
  }

  @Get(':id/approval-status')
  @Auth() // Cualquier usuario autenticado
  @ApiOperation({
    summary: 'Get approval status of a credit',
    description: 'Returns the current approval status and evaluation of a credit by ID',
  })
  @ApiParam({
    name: 'id',
    description: 'Credit ID',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiResponse({
    status: 200,
    description: 'Approval status retrieved successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Credit not found',
  })
  async getApprovalStatus(@Param('id') id: string, @GetUser() user: User) {
    // Get credit from database
    const credit = await this.creditService.findOne(id);

    if (!credit) {
      throw new HttpException('Credit not found', HttpStatus.NOT_FOUND);
    }

    // Check if user has permission to view this credit
    // User can see their own credits, admin/analysts can see all
    const hasPermission =
      credit.user.toString() === user.id ||
      user.roles.includes(ValidRoles.admin) ||
      user.roles.includes(ValidRoles.analyst1) ||
      user.roles.includes(ValidRoles.analyst2) ||
      user.roles.includes(ValidRoles.analyst3);

    if (!hasPermission) {
      throw new HttpException(
        'You do not have permission to view this credit',
        HttpStatus.FORBIDDEN,
      );
    }

    // Build context from credit data
    const context = {
      creditAmount: credit.amount,
      creditTerm: credit.quotasNumber,
      userScore: 75, // TODO: Get actual score from scoring service
      monthlyIncome: parseFloat(credit.monthlyIncome || '0'),
      currentMonthlyDebt: parseFloat(credit.monthlyExpenses || '0'),
      employmentMonths: credit.dateOfAdmission
        ? Math.floor(
            (Date.now() - new Date(credit.dateOfAdmission).getTime()) /
              (1000 * 60 * 60 * 24 * 30),
          )
        : 0,
      creditHistoryMonths: 12, // TODO: Get from user credit history
      requiredDocumentsVerified: false, // TODO: Check actual documents
    };

    // Evaluate
    const canAutoApprove = this.approvalEngine.canAutoApprove(context);
    const approvalLevel = this.approvalEngine.getRequiredApprovalLevel(
      credit.amount,
    );
    const expectedApprovalDays =
      this.approvalEngine.getExpectedApprovalDays(approvalLevel);

    return {
      creditId: credit._id,
      currentStatus: credit.status,
      canAutoApprove,
      approvalLevel,
      expectedApprovalDays,
      radicationNumber: credit.code, // Using existing code field
      radicationDate: credit.created,
      context,
    };
  }

  @Post(':id/approve')
  @Auth(ValidRoles.admin, ValidRoles.analyst1, ValidRoles.analyst2, ValidRoles.analyst3)
  @ApiOperation({
    summary: 'Manually approve a credit',
    description: 'Manually approve a credit (admin/analyst only)',
  })
  @ApiParam({
    name: 'id',
    description: 'Credit ID',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiResponse({
    status: 200,
    description: 'Credit approved successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Credit not found',
  })
  @ApiResponse({
    status: 400,
    description: 'Credit cannot be approved in current status',
  })
  async approveCredit(
    @Param('id') id: string,
    @Body() updateDto: UpdateCreditStatusDto,
    @GetUser() user: User,
  ) {
    const credit = await this.creditService.findOne(id);

    if (!credit) {
      throw new HttpException('Credit not found', HttpStatus.NOT_FOUND);
    }

    // Validate status transition
    const nextStatus = this.approvalEngine.getNextStatus(
      credit.status as CreditStatus,
      'approve',
    );

    if (!nextStatus) {
      throw new HttpException(
        `Cannot approve credit in ${credit.status} status`,
        HttpStatus.BAD_REQUEST,
      );
    }

    // Update credit status
    const updatedCredit = await this.creditService.updateStatus(id, {
      status: CreditStatus.APPROVED,
      reason: updateDto.reason || `Approved by ${user.email}`,
      notes: updateDto.notes,
    });

    // Log audit
    await this.auditService.logCreditAction(
      'CREDIT_APPROVED',
      id,
      user.id,
      user.email,
      user.roles.join(','),
      `Credit ${credit.code} approved by ${user.name} ${user.lastname}`,
      {
        previousState: { status: credit.status },
        newState: { status: CreditStatus.APPROVED },
        severity: 'HIGH',
        metadata: { reason: updateDto.reason, notes: updateDto.notes },
      },
    );

    // Send notification to user
    await this.notificationsService.notifyCreditApproved(
      credit.user.toString(),
      id,
      credit.amount,
      credit.radicationNumber || String(credit.code),
    );

    return {
      success: true,
      message: 'Credit approved successfully',
      credit: updatedCredit,
      approvedBy: user.email,
      approvedAt: new Date(),
    };
  }

  @Post(':id/reject')
  @Auth(ValidRoles.admin, ValidRoles.analyst1, ValidRoles.analyst2, ValidRoles.analyst3)
  @ApiOperation({
    summary: 'Reject a credit',
    description: 'Reject a credit (admin/analyst only)',
  })
  @ApiParam({
    name: 'id',
    description: 'Credit ID',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiResponse({
    status: 200,
    description: 'Credit rejected successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Credit not found',
  })
  async rejectCredit(
    @Param('id') id: string,
    @Body() updateDto: UpdateCreditStatusDto,
    @GetUser() user: User,
  ) {
    const credit = await this.creditService.findOne(id);

    if (!credit) {
      throw new HttpException('Credit not found', HttpStatus.NOT_FOUND);
    }

    // Validate status transition
    const nextStatus = this.approvalEngine.getNextStatus(
      credit.status as CreditStatus,
      'reject',
    );

    if (!nextStatus) {
      throw new HttpException(
        `Cannot reject credit in ${credit.status} status`,
        HttpStatus.BAD_REQUEST,
      );
    }

    // Update credit status
    const updatedCredit = await this.creditService.updateStatus(id, {
      status: CreditStatus.REJECTED,
      reason: updateDto.reason || `Rejected by ${user.email}`,
      notes: updateDto.notes,
    });

    // Log audit
    await this.auditService.logCreditAction(
      'CREDIT_REJECTED',
      id,
      user.id,
      user.email,
      user.roles.join(','),
      `Credit ${credit.code} rejected by ${user.name} ${user.lastname}`,
      {
        previousState: { status: credit.status },
        newState: { status: CreditStatus.REJECTED },
        severity: 'HIGH',
        metadata: { reason: updateDto.reason, notes: updateDto.notes },
      },
    );

    // Send notification to user
    await this.notificationsService.notifyCreditRejected(
      credit.user.toString(),
      id,
      updateDto.reason || 'No se cumplieron los requisitos',
      credit.radicationNumber || String(credit.code),
    );

    return {
      success: true,
      message: 'Credit rejected',
      credit: updatedCredit,
      rejectedBy: user.email,
      rejectedAt: new Date(),
    };
  }

  @Put(':id/status')
  @Auth(ValidRoles.admin, ValidRoles.analyst1, ValidRoles.analyst2, ValidRoles.analyst3)
  @ApiOperation({
    summary: 'Update credit status',
    description: 'Update credit status with validation of state transitions',
  })
  @ApiParam({
    name: 'id',
    description: 'Credit ID',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiResponse({
    status: 200,
    description: 'Credit status updated successfully',
  })
  async updateCreditStatus(
    @Param('id') id: string,
    @Body() updateDto: UpdateCreditStatusDto,
    @GetUser() user: User,
  ) {
    const credit = await this.creditService.findOne(id);

    if (!credit) {
      throw new HttpException('Credit not found', HttpStatus.NOT_FOUND);
    }

    const updatedCredit = await this.creditService.updateStatus(id, {
      status: updateDto.status,
      reason: updateDto.reason || `Updated by ${user.email}`,
      notes: updateDto.notes,
    });

    return {
      success: true,
      message: `Credit status updated to ${updateDto.status}`,
      credit: updatedCredit,
      updatedBy: user.email,
      updatedAt: new Date(),
    };
  }

  @Get('approval-rules')
  @Auth(ValidRoles.admin)
  @ApiOperation({
    summary: 'Get current approval rules',
    description: 'Get the current approval rules configuration (admin only)',
  })
  @ApiResponse({
    status: 200,
    description: 'Approval rules retrieved successfully',
  })
  getApprovalRules() {
    return this.approvalEngine.getApprovalRules();
  }
}
