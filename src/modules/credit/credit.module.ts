import { Module } from '@nestjs/common';
import { CreditService } from './credit.service';
import { CreditController } from './credit.controller';
import { CreditApprovalController } from './credit-approval.controller';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { Credit, CreditSchema } from './entities/credit.entity';
import { Account, AccountSchema } from '../account/entities/account.entity';
import { ApprovalEngineService } from '../approver/services/approval-engine.service';
import { AuditModule } from '../audit/audit.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    ConfigModule,
    MongooseModule.forFeature([
      { name: Credit.name, schema: CreditSchema },
      { name: Account.name, schema: AccountSchema },
    ]),
    AuditModule,
    NotificationsModule,
  ],
  controllers: [CreditController, CreditApprovalController],
  providers: [CreditService, ApprovalEngineService],
  exports: [CreditService, CreditModule],
})
export class CreditModule {}
