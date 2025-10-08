import { Test, TestingModule } from '@nestjs/testing';
import { ApproverController } from './approver.controller';
import { ApproverService } from './approver.service';

describe('ApproverController', () => {
  let controller: ApproverController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ApproverController],
      providers: [ApproverService],
    }).compile();

    controller = module.get<ApproverController>(ApproverController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
