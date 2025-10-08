import { Module } from '@nestjs/common';
import { TaxesService } from './taxes.service';
import { TaxesController } from './taxes.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Taxes, TaxesSchema } from './entities/taxes.entity';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Taxes.name, schema: TaxesSchema }]),
  ],
  controllers: [TaxesController],
  providers: [TaxesService],
})
export class TaxesModule {}
