import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { DigitalBehaviorService } from './digital-behavior.service';
import { CreateBehaviorEventDto } from './dto/create-behavior-event.dto';
import { QueryBehaviorDto } from './dto/query-behavior.dto';
import { Auth, GetUser } from '../auth/decorators';
import { User } from '../auth/entities/user.entity';
import { ValidRoles } from '../auth/interfaces';

@Controller('behavior')
export class DigitalBehaviorController {
  constructor(
    private readonly digitalBehaviorService: DigitalBehaviorService,
  ) {}

  @Post('track')
  @Auth()
  async trackEvent(@Body() createEventDto: CreateBehaviorEventDto) {
    return this.digitalBehaviorService.trackEvent(createEventDto);
  }

  @Get(':userId/timeline')
  @Auth(ValidRoles.admin, ValidRoles.approver)
  async getUserTimeline(
    @Param('userId') userId: string,
    @Query() queryDto: QueryBehaviorDto,
  ) {
    return this.digitalBehaviorService.getUserTimeline(userId, queryDto);
  }

  @Get(':userId/analysis')
  @Auth(ValidRoles.admin, ValidRoles.approver)
  async analyzeUser(
    @Param('userId') userId: string,
    @Query('daysBack') daysBack?: string,
  ) {
    const days = daysBack ? parseInt(daysBack) : 30;
    return this.digitalBehaviorService.analyzeUserBehavior(userId, days);
  }

  @Get(':userId/anomalies')
  @Auth(ValidRoles.admin, ValidRoles.approver)
  async getUserAnomalies(
    @Param('userId') userId: string,
    @Query('limit') limit?: string,
  ) {
    const limitNum = limit ? parseInt(limit) : 50;
    return this.digitalBehaviorService.getUserAnomalies(userId, limitNum);
  }

  @Get('high-risk')
  @Auth(ValidRoles.admin)
  async getHighRiskEvents(@Query('limit') limit?: string) {
    const limitNum = limit ? parseInt(limit) : 100;
    return this.digitalBehaviorService.getHighRiskEvents(limitNum);
  }
}
