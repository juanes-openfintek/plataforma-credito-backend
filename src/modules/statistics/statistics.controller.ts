import { Controller, Get, Query } from '@nestjs/common';
import { StatisticsService } from './statistics.service';
import { Auth } from '../auth/decorators/auth.decorator';
import { ValidRoles } from '../auth/interfaces';

@Controller('statistics')
export class StatisticsController {
  constructor(private readonly statisticsService: StatisticsService) {}

  @Get('amountTicketsCollected')
  @Auth(ValidRoles.admin, ValidRoles.analyst1, ValidRoles.analyst2, ValidRoles.analyst3)
  async getAmountTicketsCollected(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.statisticsService.getAmountTicketsCollected(startDate, endDate);
  }

  @Get('amountCirculation')
  @Auth(ValidRoles.admin, ValidRoles.analyst1, ValidRoles.analyst2, ValidRoles.analyst3)
  async getAmountCirculation(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.statisticsService.getAmountCirculation(startDate, endDate);
  }

  @Get('credits')
  @Auth(ValidRoles.admin, ValidRoles.analyst1, ValidRoles.analyst2, ValidRoles.analyst3)
  async getCredits(@Query('status') status?: string) {
    return this.statisticsService.getCredits(status);
  }
}
