import { Module } from '@nestjs/common';
import { CalculationService } from './services/calculation.service';
import { ScoringController } from './scoring.controller';

@Module({
  controllers: [ScoringController],
  providers: [CalculationService],
  exports: [CalculationService],
})
export class RatesModule {}
