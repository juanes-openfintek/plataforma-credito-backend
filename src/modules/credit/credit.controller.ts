import { Controller, Post, Body, Get, Query, Param, HttpException, HttpStatus } from '@nestjs/common';
import { CreditService } from './credit.service';
import { CreateCreditDto } from './dto/create-credit.dto';
import { ValidRoles } from '../../modules/auth/interfaces';
import { Auth, GetUser } from '../../modules/auth/decorators';
import { User } from '../../modules/auth/entities/user.entity';
import { ObjectId } from '../../helpers/objectId';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';

@ApiTags('Credit')
@Controller('credit')
export class CreditController {
  constructor(private readonly creditService: CreditService) {}

  @Post('create')
  @Auth(ValidRoles.user)
  create(@Body() createCreditDto: CreateCreditDto, @GetUser() user: User) {
    return this.creditService.create(ObjectId(user.id), createCreditDto);
  }

  @Post('create-without-user')
  createWithoutUser(@Body() createCreditDto: CreateCreditDto) {
    return this.creditService.createWithoutUser(createCreditDto);
  }

  @Get('get-credits-by-user')
  @Auth(ValidRoles.user)
  getCreditsByUser(@GetUser() user: User) {
    return this.creditService.getCreditsByUser(ObjectId(user.id));
  }

  @Get('get-all-credits')
  @Auth(ValidRoles.admin, ValidRoles.approver, ValidRoles.disburser)
  getAllCredits(@Query('status') status?: string) {
    const filter = status ? { status } : {};
    return this.creditService.getAllCredits(filter);
  }

  @Get(':id/radication-info')
  @Auth()
  @ApiOperation({
    summary: 'Get radication information',
    description: 'Returns the radication number, date, and source for a credit'
  })
  @ApiParam({
    name: 'id',
    description: 'Credit ID',
    example: '507f1f77bcf86cd799439011'
  })
  @ApiResponse({
    status: 200,
    description: 'Radication information retrieved successfully',
    schema: {
      example: {
        radicationNumber: 'RAD-2025-1027-00001',
        radicationDate: '2025-10-27T15:30:00Z',
        radicationSource: 'WEB',
        code: 1,
        status: 'PENDING_APPROVAL',
        estimatedReviewDays: '2 días hábiles'
      }
    }
  })
  async getRadicationInfo(@Param('id') id: string, @GetUser() user: User) {
    const credit = await this.creditService.findOne(id);

    if (!credit) {
      throw new HttpException('Credit not found', HttpStatus.NOT_FOUND);
    }

    // Check permissions
    const hasPermission =
      credit.user.toString() === user.id ||
      user.roles.includes(ValidRoles.admin) ||
      user.roles.includes(ValidRoles.approver) ||
      user.roles.includes(ValidRoles.disburser);

    if (!hasPermission) {
      throw new HttpException(
        'You do not have permission to view this credit',
        HttpStatus.FORBIDDEN
      );
    }

    return {
      radicationNumber: credit.radicationNumber,
      radicationDate: credit.radicationDate,
      radicationSource: credit.radicationSource,
      code: credit.code,
      status: credit.status,
      estimatedReviewDays: this.getEstimatedReviewDays(credit.amount),
      creditAmount: credit.amount,
      createdAt: credit.created
    };
  }

  private getEstimatedReviewDays(amount: number): string {
    if (amount <= 5000) return '0 días (inmediato)';
    if (amount <= 25000) return '2 días hábiles';
    if (amount <= 100000) return '5 días hábiles';
    return '10 días hábiles';
  }
}
