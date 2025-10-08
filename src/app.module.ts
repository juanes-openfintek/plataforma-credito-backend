import { MiddlewareConsumer, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { AuthMiddleware } from './middleware/auth.middleware';
import { CreditModule } from './modules/credit/credit.module';
import { TaxesModule } from './modules/taxes/taxes.module';
import { AdminModule } from './modules/admin/admin.module';
import { UserModule } from './modules/user/user.module';
import { DisburserModule } from './modules/disburser/disburser.module';
import { ApproverModule } from './modules/approver/approver.module';
import { FilesModule } from './modules/files/files.module';
import { AccountModule } from './modules/account/account.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    MongooseModule.forRoot(process.env.MONGO_DATABASE_URL, {
      autoIndex: true,
    }),
    AuthModule,
    CreditModule,
    TaxesModule,
    AdminModule,
    UserModule,
    DisburserModule,
    ApproverModule,
    FilesModule,
    AccountModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware).forRoutes('*'); // Aplica la middleware a todas las rutas
  }
}
