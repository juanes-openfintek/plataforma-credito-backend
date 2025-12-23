import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  Analyst1Controller,
  Analyst2Controller,
  Analyst3Controller,
} from './analyst.controller';
import { AnalystService } from './analyst.service';
import { ValidationEngineService } from './services/validation-engine.service';
import { ApprovalEngineService } from './services/approval-engine.service';
import { Credit, CreditSchema } from '../credit/entities/credit.entity';
import { AuthModule } from '../auth/auth.module';
import { AuditModule } from '../audit/audit.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Credit.name, schema: CreditSchema }]),
    AuthModule,
    AuditModule,
    NotificationsModule,
  ],
  controllers: [Analyst1Controller, Analyst2Controller, Analyst3Controller],
  providers: [AnalystService, ValidationEngineService, ApprovalEngineService],
  exports: [AnalystService, ValidationEngineService, ApprovalEngineService],
})
export class AnalystModule {}
