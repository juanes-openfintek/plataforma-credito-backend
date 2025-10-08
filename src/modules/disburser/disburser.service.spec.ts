import { Test, TestingModule } from '@nestjs/testing';
import { DisburserService } from './disburser.service';

describe('DisburserService', () => {
  let service: DisburserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DisburserService],
    }).compile();

    service = module.get<DisburserService>(DisburserService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
