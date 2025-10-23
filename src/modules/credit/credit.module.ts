import { Module } from '@nestjs/common';
import { CreditService } from './credit.service';
import { CreditController } from './credit.controller';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { Credit, CreditSchema } from './entities/credit.entity';
import { Account, AccountSchema } from '../account/entities/account.entity';

@Module({
  imports: [
    ConfigModule,
    MongooseModule.forFeature([
      { name: Credit.name, schema: CreditSchema },
      { name: Account.name, schema: AccountSchema },
    ]),
  ],
  controllers: [CreditController],
  providers: [CreditService],
  exports: [CreditService, CreditModule],
})
export class CreditModule {}
