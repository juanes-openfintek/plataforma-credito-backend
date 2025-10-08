import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ApproverService } from './approver.service';
import { CreateApproverDto } from './dto/create-approver.dto';
import { UpdateApproverDto } from './dto/update-approver.dto';
import { Auth } from '../auth/decorators';
import { ValidRoles } from '../auth/interfaces';

@Controller('approver')
@Auth(ValidRoles.approver, ValidRoles.admin)
export class ApproverController {
  constructor(private readonly approverService: ApproverService) {}

  @Post()
  create(@Body() createApproverDto: CreateApproverDto) {
    return this.approverService.create(createApproverDto);
  }

  @Get()
  findAll() {
    return this.approverService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.approverService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateApproverDto: UpdateApproverDto,
  ) {
    return this.approverService.update(+id, updateApproverDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.approverService.remove(+id);
  }
}
