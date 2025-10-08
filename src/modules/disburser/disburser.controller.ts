import { Controller, Get, Body, Put } from '@nestjs/common';
import { DisburserService } from './disburser.service';
import { Auth } from '../auth/decorators';
import { ValidRoles } from '../auth/interfaces';
import { CreditService } from '../credit/credit.service';
import { GetCredit, UpdateCreditsDto } from '../credit/dto/update-credit.dto';

@Controller('disburser')
@Auth(ValidRoles.disburser, ValidRoles.admin)
export class DisburserController {
  constructor(
    private readonly disburserService: DisburserService,
    private readonly creditService: CreditService,
  ) {}

  @Get('get-all-credits')
  getAllCredits(@Body() body: GetCredit) {
    return this.creditService.getAllCredits(body);
  }

  @Put('update-credit')
  updateCredit(@Body() body: UpdateCreditsDto) {
    return this.creditService.updateCredit(body);
  }
}
