import { Test, TestingModule } from '@nestjs/testing';
import { ApproverService } from './approver.service';

describe('ApproverService', () => {
  let service: ApproverService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ApproverService],
    }).compile();

    service = module.get<ApproverService>(ApproverService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
