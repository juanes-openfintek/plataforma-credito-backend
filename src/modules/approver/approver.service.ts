import { Injectable } from '@nestjs/common';
import { CreateApproverDto } from './dto/create-approver.dto';
import { UpdateApproverDto } from './dto/update-approver.dto';

@Injectable()
export class ApproverService {
  create(createApproverDto: CreateApproverDto) {
    return 'This action adds a new approver';
  }

  findAll() {
    return `This action returns all approver`;
  }

  findOne(id: number) {
    return `This action returns a #${id} approver`;
  }

  update(id: number, updateApproverDto: UpdateApproverDto) {
    return `This action updates a #${id} approver`;
  }

  remove(id: number) {
    return `This action removes a #${id} approver`;
  }
}
