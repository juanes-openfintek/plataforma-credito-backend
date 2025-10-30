import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { OnboardingService } from './onboarding.service';
import { OnboardingController } from './onboarding.controller';
import {
  OnboardingSession,
  OnboardingSessionSchema,
} from './entities/onboarding-session.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: OnboardingSession.name, schema: OnboardingSessionSchema },
    ]),
  ],
  controllers: [OnboardingController],
  providers: [OnboardingService],
  exports: [OnboardingService],
})
export class OnboardingModule {}
