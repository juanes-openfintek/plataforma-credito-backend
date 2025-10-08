import { PartialType } from '@nestjs/swagger';
import { CreateApproverDto } from './create-approver.dto';

export class UpdateApproverDto extends PartialType(CreateApproverDto) {}
