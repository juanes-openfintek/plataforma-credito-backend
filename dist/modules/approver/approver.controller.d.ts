import { ApproverService } from './approver.service';
import { CreateApproverDto } from './dto/create-approver.dto';
import { UpdateApproverDto } from './dto/update-approver.dto';
export declare class ApproverController {
    private readonly approverService;
    constructor(approverService: ApproverService);
    create(createApproverDto: CreateApproverDto): string;
    findAll(): string;
    findOne(id: string): string;
    update(id: string, updateApproverDto: UpdateApproverDto): string;
    remove(id: string): string;
}
