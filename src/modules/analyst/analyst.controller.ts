import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { AnalystService } from './analyst.service';
import { ProcessCreditDto } from './dto/process-credit.dto';
import { UpdateCreditDataDto } from './dto/update-credit-data.dto';
import { Auth, GetUser } from '../auth/decorators';
import { ValidRoles } from '../auth/interfaces';
import { User } from '../auth/entities/user.entity';

@ApiTags('Analyst 1 - Validación Inicial')
@Controller('analyst1')
@Auth(ValidRoles.analyst1, ValidRoles.admin)
export class Analyst1Controller {
  constructor(private readonly analystService: AnalystService) {}

  @Get('credits')
  @ApiOperation({ summary: 'Get pending credits for Analyst 1' })
  @ApiResponse({ status: 200, description: 'List of pending credits' })
  async getCredits(@Query('search') search?: string) {
    return this.analystService.getCreditsForAnalyst(1, { search });
  }

  @Get('credits/:id')
  @ApiOperation({ summary: 'Get specific credit details' })
  @ApiParam({ name: 'id', description: 'Credit ID' })
  @ApiResponse({ status: 200, description: 'Credit details' })
  @ApiResponse({ status: 404, description: 'Credit not found' })
  async getCreditById(@Param('id') id: string) {
    return this.analystService.getCreditById(id);
  }

  @Post('credits/:id/process')
  @ApiOperation({ summary: 'Process credit (approve/reject/return)' })
  @ApiParam({ name: 'id', description: 'Credit ID' })
  @ApiResponse({ status: 200, description: 'Credit processed successfully' })
  @ApiResponse({ status: 400, description: 'Invalid action or data' })
  async processCredit(
    @Param('id') id: string,
    @Body() processDto: ProcessCreditDto,
    @GetUser() user: User,
  ) {
    return this.analystService.processCredit(
      id,
      user.id,
      ValidRoles.analyst1 as any,
      processDto,
    );
  }

  @Put('credits/:id/data')
  @ApiOperation({ summary: 'Update credit data' })
  @ApiParam({ name: 'id', description: 'Credit ID' })
  @ApiResponse({ status: 200, description: 'Credit data updated' })
  async updateCreditData(
    @Param('id') id: string,
    @Body() updateDto: UpdateCreditDataDto,
    @GetUser() user: User,
  ) {
    return this.analystService.updateCreditData(
      id,
      user.id,
      ValidRoles.analyst1 as any,
      updateDto,
    );
  }

  @Get('credits/:id/validations')
  @ApiOperation({ summary: 'Get automatic validations for credit' })
  @ApiParam({ name: 'id', description: 'Credit ID' })
  @ApiResponse({ status: 200, description: 'Validation results' })
  async getValidations(@Param('id') id: string) {
    return this.analystService.getAutomaticValidations(id);
  }

  @Post('credits/:id/comments')
  @ApiOperation({ summary: 'Add comment to credit' })
  @ApiParam({ name: 'id', description: 'Credit ID' })
  @ApiResponse({ status: 200, description: 'Comment added' })
  async addComment(
    @Param('id') id: string,
    @Body('comment') comment: string,
    @GetUser() user: User,
  ) {
    return this.analystService.addComment(id, user.id, comment);
  }
}

@ApiTags('Analyst 2 - Análisis Cualitativo')
@Controller('analyst2')
@Auth(ValidRoles.analyst2, ValidRoles.admin)
export class Analyst2Controller {
  constructor(private readonly analystService: AnalystService) {}

  @Get('credits')
  @ApiOperation({ summary: 'Get pending credits for Analyst 2' })
  @ApiResponse({ status: 200, description: 'List of pending credits' })
  async getCredits(@Query('search') search?: string) {
    return this.analystService.getCreditsForAnalyst(2, { search });
  }

  @Get('credits/:id')
  @ApiOperation({ summary: 'Get specific credit details' })
  @ApiParam({ name: 'id', description: 'Credit ID' })
  @ApiResponse({ status: 200, description: 'Credit details' })
  @ApiResponse({ status: 404, description: 'Credit not found' })
  async getCreditById(@Param('id') id: string) {
    return this.analystService.getCreditById(id);
  }

  @Post('credits/:id/process')
  @ApiOperation({
    summary: 'Process credit with reference verification',
  })
  @ApiParam({ name: 'id', description: 'Credit ID' })
  @ApiResponse({ status: 200, description: 'Credit processed successfully' })
  @ApiResponse({ status: 400, description: 'Invalid action or data' })
  async processCredit(
    @Param('id') id: string,
    @Body() processDto: ProcessCreditDto,
    @GetUser() user: User,
  ) {
    return this.analystService.processCredit(
      id,
      user.id,
      ValidRoles.analyst2 as any,
      processDto,
    );
  }

  @Put('credits/:id/data')
  @ApiOperation({ summary: 'Update credit labor data' })
  @ApiParam({ name: 'id', description: 'Credit ID' })
  @ApiResponse({ status: 200, description: 'Credit data updated' })
  async updateCreditData(
    @Param('id') id: string,
    @Body() updateDto: UpdateCreditDataDto,
    @GetUser() user: User,
  ) {
    return this.analystService.updateCreditData(
      id,
      user.id,
      ValidRoles.analyst2 as any,
      updateDto,
    );
  }

  @Post('credits/:id/comments')
  @ApiOperation({ summary: 'Add comment to credit' })
  @ApiParam({ name: 'id', description: 'Credit ID' })
  @ApiResponse({ status: 200, description: 'Comment added' })
  async addComment(
    @Param('id') id: string,
    @Body('comment') comment: string,
    @GetUser() user: User,
  ) {
    return this.analystService.addComment(id, user.id, comment);
  }

  @Get('credits/:id/validations')
  @ApiOperation({ summary: 'Get automatic validations for credit' })
  @ApiParam({ name: 'id', description: 'Credit ID' })
  @ApiResponse({ status: 200, description: 'Validation results' })
  async getValidations(@Param('id') id: string) {
    return this.analystService.getAutomaticValidations(id);
  }
}

@ApiTags('Analyst 3 - Preaprobación y Documentos')
@Controller('analyst3')
@Auth(ValidRoles.analyst3, ValidRoles.admin)
export class Analyst3Controller {
  constructor(private readonly analystService: AnalystService) {}

  @Get('credits')
  @ApiOperation({ summary: 'Get pending credits for Analyst 3' })
  @ApiResponse({ status: 200, description: 'List of pending credits' })
  async getCredits(@Query('search') search?: string) {
    return this.analystService.getCreditsForAnalyst(3, { search });
  }

  @Get('credits/:id')
  @ApiOperation({ summary: 'Get specific credit details' })
  @ApiParam({ name: 'id', description: 'Credit ID' })
  @ApiResponse({ status: 200, description: 'Credit details' })
  @ApiResponse({ status: 404, description: 'Credit not found' })
  async getCreditById(@Param('id') id: string) {
    return this.analystService.getCreditById(id);
  }

  @Post('credits/:id/process')
  @ApiOperation({
    summary: 'Process credit with document validation',
  })
  @ApiParam({ name: 'id', description: 'Credit ID' })
  @ApiResponse({ status: 200, description: 'Credit processed successfully' })
  @ApiResponse({ status: 400, description: 'Invalid action or data' })
  async processCredit(
    @Param('id') id: string,
    @Body() processDto: ProcessCreditDto,
    @GetUser() user: User,
  ) {
    return this.analystService.processCredit(
      id,
      user.id,
      ValidRoles.analyst3 as any,
      processDto,
    );
  }

  @Post('credits/:id/signature-link')
  @ApiOperation({ summary: 'Generate electronic signature link' })
  @ApiParam({ name: 'id', description: 'Credit ID' })
  @ApiResponse({
    status: 200,
    description: 'Signature link generated successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Credit not ready for signature',
  })
  async generateSignatureLink(
    @Param('id') id: string,
    @GetUser() user: User,
  ) {
    return this.analystService.generateSignatureLink(
      id,
      user.id,
      ValidRoles.analyst3 as any,
    );
  }

  @Post('credits/:id/disburse')
  @ApiOperation({ summary: 'Confirm credit ready for disbursement' })
  @ApiParam({ name: 'id', description: 'Credit ID' })
  @ApiResponse({ status: 200, description: 'Credit ready for disbursement' })
  @ApiResponse({
    status: 400,
    description: 'Credit not ready for disbursement',
  })
  async confirmDisburse(
    @Param('id') id: string,
    @Body() disburseData: any,
    @GetUser() user: User,
  ) {
    return this.analystService.confirmDisburse(
      id,
      user.id,
      ValidRoles.analyst3 as any,
      disburseData,
    );
  }

  @Post('credits/:id/comments')
  @ApiOperation({ summary: 'Add comment to credit' })
  @ApiParam({ name: 'id', description: 'Credit ID' })
  @ApiResponse({ status: 200, description: 'Comment added' })
  async addComment(
    @Param('id') id: string,
    @Body('comment') comment: string,
    @GetUser() user: User,
  ) {
    return this.analystService.addComment(id, user.id, comment);
  }

  @Get('credits/:id/validations')
  @ApiOperation({ summary: 'Get automatic validations for credit' })
  @ApiParam({ name: 'id', description: 'Credit ID' })
  @ApiResponse({ status: 200, description: 'Validation results' })
  async getValidations(@Param('id') id: string) {
    return this.analystService.getAutomaticValidations(id);
  }
}
