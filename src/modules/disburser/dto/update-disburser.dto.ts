import { PartialType } from '@nestjs/swagger';
import { CreateDisburserDto } from './create-disburser.dto';

export class UpdateDisburserDto extends PartialType(CreateDisburserDto) {}
