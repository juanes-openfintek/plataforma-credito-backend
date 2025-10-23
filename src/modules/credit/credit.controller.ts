import { Controller, Post, Body, Get, Query } from '@nestjs/common';
import { CreditService } from './credit.service';
import { CreateCreditDto } from './dto/create-credit.dto';
import { ValidRoles } from '../../modules/auth/interfaces';
import { Auth, GetUser } from '../../modules/auth/decorators';
import { User } from '../../modules/auth/entities/user.entity';
import { ObjectId } from '../../helpers/objectId';

@Controller('credit')
export class CreditController {
  constructor(private readonly creditService: CreditService) {}

  @Post('create')
  @Auth(ValidRoles.user)
  create(@Body() createCreditDto: CreateCreditDto, @GetUser() user: User) {
    return this.creditService.create(ObjectId(user.id), createCreditDto);
  }

  @Post('create-without-user')
  @Auth()
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
}
