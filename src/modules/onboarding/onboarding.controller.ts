import { Controller, Get, Post, Patch, Body, Param, Query } from '@nestjs/common';
import { OnboardingService } from './onboarding.service';
import { Auth, GetUser } from '../auth/decorators';
import { User } from '../auth/entities/user.entity';
import { ValidRoles } from '../auth/interfaces';

@Controller('onboarding')
export class OnboardingController {
  constructor(private readonly onboardingService: OnboardingService) {}

  @Post('start')
  @Auth()
  async startSession(
    @GetUser() user: User,
    @Body() data: { ipAddress?: string; deviceInfo?: string },
  ) {
    return this.onboardingService.startSession(
      user.id,
      data.ipAddress,
      data.deviceInfo,
    );
  }

  @Get(':sessionId/status')
  @Auth()
  async getStatus(@Param('sessionId') sessionId: string) {
    return this.onboardingService.getSession(sessionId);
  }

  @Patch(':sessionId/stage')
  @Auth()
  async updateStage(
    @Param('sessionId') sessionId: string,
    @Body('stage') stage: number,
  ) {
    return this.onboardingService.updateStage(sessionId, stage);
  }

  @Post(':sessionId/upload')
  @Auth()
  async uploadDocument(
    @Param('sessionId') sessionId: string,
    @Body()
    data: {
      documentType: 'dni' | 'selfie' | 'proof';
      fileUrl: string;
    },
  ) {
    return this.onboardingService.uploadDocument(
      sessionId,
      data.documentType,
      data.fileUrl,
    );
  }

  @Post(':sessionId/biometry')
  @Auth()
  async verifyBiometry(@Param('sessionId') sessionId: string) {
    return this.onboardingService.verifyBiometry(sessionId);
  }

  @Post(':sessionId/employment')
  @Auth()
  async completeEmployment(
    @Param('sessionId') sessionId: string,
    @Body() employmentData: any,
  ) {
    return this.onboardingService.completeEmployment(sessionId, employmentData);
  }

  @Post(':sessionId/banking')
  @Auth()
  async completeBanking(
    @Param('sessionId') sessionId: string,
    @Body() bankingData: any,
  ) {
    return this.onboardingService.completeBanking(sessionId, bankingData);
  }

  @Post(':sessionId/complete')
  @Auth()
  async completeSession(@Param('sessionId') sessionId: string) {
    return this.onboardingService.completeSession(sessionId);
  }

  @Get('user/sessions')
  @Auth()
  async getUserSessions(@GetUser() user: User) {
    return this.onboardingService.getUserSessions(user.id);
  }

  @Get('incomplete')
  @Auth(ValidRoles.admin)
  async getIncompleteSessions(@Query('daysOld') daysOld?: string) {
    const days = daysOld ? parseInt(daysOld) : 7;
    return this.onboardingService.getIncompleteSessions(days);
  }

  @Patch(':sessionId/abandon')
  @Auth()
  async abandonSession(@Param('sessionId') sessionId: string) {
    return this.onboardingService.abandonSession(sessionId);
  }
}
