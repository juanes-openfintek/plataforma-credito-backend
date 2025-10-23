import { Controller, Get, Body, Post, Put } from '@nestjs/common';
import { TaxesService } from './taxes.service';
import { GetTaxesDto, UpdateTaxesDto } from './dto/update-taxes.dto';
import { CreateTaxesDto } from './dto/create-taxes.dto';
import { ValidRoles } from '../auth/interfaces';
import { Auth } from '../auth/decorators';

@Controller('taxes')
export class TaxesController {
  constructor(private readonly taxesService: TaxesService) {}

  @Get()
  findAll(@Body() body: GetTaxesDto) {
    return this.taxesService.findAll(body);
  }

  @Auth(ValidRoles.admin)
  @Post('create')
  create(@Body() body: CreateTaxesDto) {
    return this.taxesService.create(body);
  }

  @Auth()
  @Get('get-by-range')
  getByRange(@Body('value') value: number) {
    return this.taxesService.getByRange(value);
  }

  @Auth(ValidRoles.admin)
  @Put('update')
  update(@Body() body: UpdateTaxesDto) {
    return this.taxesService.update(body);
  }
}
