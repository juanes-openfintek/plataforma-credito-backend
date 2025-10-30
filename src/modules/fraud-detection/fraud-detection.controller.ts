import { Controller, Get, Post, Body, Param, Patch, Query } from '@nestjs/common';
import { FraudDetectionService } from './fraud-detection.service';
import { Auth, GetUser } from '../auth/decorators';
import { User } from '../auth/entities/user.entity';
import { ValidRoles } from '../auth/interfaces';

@Controller('fraud')
export class FraudDetectionController {
  constructor(private readonly fraudDetectionService: FraudDetectionService) {}

  @Post('check/:userId')
  @Auth(ValidRoles.admin, ValidRoles.approver)
  async checkUser(
    @Param('userId') userId: string,
    @Body() userDoc: any,
    @Body('ipAddress') ipAddress?: string,
  ) {
    return this.fraudDetectionService.checkUser(userId, userDoc, ipAddress);
  }

  @Post('check-credit/:creditId')
  @Auth(ValidRoles.admin, ValidRoles.approver)
  async checkCredit(
    @Param('creditId') creditId: string,
    @Body() data: { userId: string; creditData: any; userDoc: any; ipAddress?: string },
  ) {
    return this.fraudDetectionService.checkCredit(
      creditId,
      data.userId,
      data.creditData,
      data.userDoc,
      data.ipAddress,
    );
  }

  @Get('alerts')
  @Auth(ValidRoles.admin, ValidRoles.approver)
  async getActiveAlerts(@Query('limit') limit?: string) {
    const limitNum = limit ? parseInt(limit) : 100;
    return this.fraudDetectionService.getActiveAlerts(limitNum);
  }

  @Get('history/:userId')
  @Auth(ValidRoles.admin, ValidRoles.approver)
  async getUserHistory(@Param('userId') userId: string) {
    return this.fraudDetectionService.getUserFraudHistory(userId);
  }

  @Patch(':id/review')
  @Auth(ValidRoles.admin)
  async markAsReviewed(
    @Param('id') id: string,
    @Body() reviewData: { notes: string; action: string },
    @GetUser() user: User,
  ) {
    return this.fraudDetectionService.markAsReviewed(
      id,
      user.id,
      reviewData.notes,
      reviewData.action,
    );
  }
}
