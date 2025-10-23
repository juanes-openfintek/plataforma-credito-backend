import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { StatisticsController } from './statistics.controller';
import { StatisticsService } from './statistics.service';
import { Credit, CreditSchema } from '../credit/entities/credit.entity';
import { Account, AccountSchema } from '../account/entities/account.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Credit.name,
        schema: CreditSchema,
      },
      {
        name: Account.name,
        schema: AccountSchema,
      },
    ]),
    AuthModule,
  ],
  controllers: [StatisticsController],
  providers: [StatisticsService],
  exports: [StatisticsService],
})
export class StatisticsModule {}
