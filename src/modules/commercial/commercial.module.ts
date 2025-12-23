import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CommercialService } from './commercial.service';
import { CommercialController } from './commercial.controller';
import { CommercialUser, CommercialUserSchema } from './entities/commercial-user.entity';
import { ClienteCreacion, ClienteCreacionSchema } from './entities/cliente-creacion.entity';
import { Simulation, SimulationSchema } from './entities/simulation.entity';
import { SimulationService } from './services/simulation.service';
import { TwilioService } from './services/twilio.service';
import { OtpService } from './services/otp.service';
import { CreditSubmissionService } from './services/credit-submission.service';
import { Credit, CreditSchema } from '../credit/entities/credit.entity';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: CommercialUser.name, schema: CommercialUserSchema },
      { name: ClienteCreacion.name, schema: ClienteCreacionSchema },
      { name: Simulation.name, schema: SimulationSchema },
      { name: Credit.name, schema: CreditSchema },
    ]),
    NotificationsModule,
  ],
  providers: [CommercialService, SimulationService, TwilioService, OtpService, CreditSubmissionService],
  controllers: [CommercialController],
  exports: [CommercialService, SimulationService, TwilioService, OtpService, CreditSubmissionService, CommercialModule],
})
export class CommercialModule {}
