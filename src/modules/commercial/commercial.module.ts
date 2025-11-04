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

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: CommercialUser.name, schema: CommercialUserSchema },
      { name: ClienteCreacion.name, schema: ClienteCreacionSchema },
      { name: Simulation.name, schema: SimulationSchema },
    ]),
  ],
  providers: [CommercialService, SimulationService, TwilioService, OtpService],
  controllers: [CommercialController],
  exports: [CommercialService, SimulationService, TwilioService, OtpService, CommercialModule],
})
export class CommercialModule {}
