import { Module } from '@nestjs/common';
import { DisburserService } from './disburser.service';
import { DisburserController } from './disburser.controller';
import { CreditService } from '../credit/credit.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Credit, CreditSchema } from '../credit/entities/credit.entity';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Credit.name, schema: CreditSchema }]),
  ],
  controllers: [DisburserController],
  providers: [DisburserService, CreditService],
})
export class DisburserModule {}
