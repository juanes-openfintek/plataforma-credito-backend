import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FraudDetectionService } from './fraud-detection.service';
import { FraudDetectionController } from './fraud-detection.controller';
import { FraudCheck, FraudCheckSchema } from './entities/fraud-check.entity';
import { DigitalBehaviorModule } from '../digital-behavior/digital-behavior.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: FraudCheck.name, schema: FraudCheckSchema },
    ]),
    DigitalBehaviorModule,
  ],
  controllers: [FraudDetectionController],
  providers: [FraudDetectionService],
  exports: [FraudDetectionService],
})
export class FraudDetectionModule {}
