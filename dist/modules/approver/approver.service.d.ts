import { CreateApproverDto } from './dto/create-approver.dto';
import { UpdateApproverDto } from './dto/update-approver.dto';
export declare class ApproverService {
    create(createApproverDto: CreateApproverDto): string;
    findAll(): string;
    findOne(id: number): string;
    update(id: number, updateApproverDto: UpdateApproverDto): string;
    remove(id: number): string;
}
