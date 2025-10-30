import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DigitalBehaviorService } from './digital-behavior.service';
import { DigitalBehaviorController } from './digital-behavior.controller';
import {
  DigitalBehaviorEvent,
  DigitalBehaviorEventSchema,
} from './entities/digital-behavior-event.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: DigitalBehaviorEvent.name, schema: DigitalBehaviorEventSchema },
    ]),
  ],
  controllers: [DigitalBehaviorController],
  providers: [DigitalBehaviorService],
  exports: [DigitalBehaviorService],
})
export class DigitalBehaviorModule {}
