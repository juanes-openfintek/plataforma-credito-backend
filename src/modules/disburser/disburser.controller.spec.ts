import { Test, TestingModule } from '@nestjs/testing';
import { DisburserController } from './disburser.controller';
import { DisburserService } from './disburser.service';

describe('DisburserController', () => {
  let controller: DisburserController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DisburserController],
      providers: [DisburserService],
    }).compile();

    controller = module.get<DisburserController>(DisburserController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
