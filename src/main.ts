import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { ConfigService } from '@nestjs/config';
import { ServiceAccount } from 'firebase-admin';
import * as firebase from 'firebase/app';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService: ConfigService = app.get(ConfigService);

  const adminConfig: ServiceAccount = {
    projectId: configService.get<string>('FIREBASE_PROJECT_ID'),
    privateKey: configService
      .get<string>('FIREBASE_PRIVATE_KEY')
      .replace(/\\n/g, '\n'),
    clientEmail: configService.get<string>('FIREBASE_CLIENT_EMAIL'),
  };

  firebase.initializeApp({
    apiKey: configService.get<string>('FIREBASE_API_KEY'),
    authDomain: configService.get<string>('FIREBASE_AUTH_DOMAIN'),
    databaseURL: configService.get<string>('FIREBASE_DATABASE_URL'),
    projectId: configService.get<string>('FIREBASE_PROJECT_ID'),
    storageBucket: configService.get<string>('FIREBASE_STORAGE_BUCKET'),
    messagingSenderId: configService.get<string>(
      'FIREBASE_MESSAGING_SENDER_ID',
    ),
    appId: configService.get<string>('FIREBASE_APP_ID'),
  });

  // Initialize the firebase admin app
  admin.initializeApp({
    credential: admin.credential.cert(adminConfig),
    databaseURL: configService.get<string>('FIREBASE_DATABASE_URL'),
    storageBucket: 'gs://feelpay-backend.appspot.com/',
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  // app.setGlobalPrefix('api');

  const config = new DocumentBuilder()
    .setTitle('Feelpay API')
    .setDescription('The Feelpay API description')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(3001).then(() => {
    console.log('Server running on port http://localhost:3001');
  });
}
bootstrap();
