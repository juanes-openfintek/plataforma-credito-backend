"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const common_1 = require("@nestjs/common");
const admin = require("firebase-admin");
const config_1 = require("@nestjs/config");
const firebase = require("firebase/app");
const swagger_1 = require("@nestjs/swagger");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    const configService = app.get(config_1.ConfigService);
    const adminConfig = {
        projectId: configService.get('FIREBASE_PROJECT_ID'),
        privateKey: configService
            .get('FIREBASE_PRIVATE_KEY')
            .replace(/\\n/g, '\n'),
        clientEmail: configService.get('FIREBASE_CLIENT_EMAIL'),
    };
    firebase.initializeApp({
        apiKey: configService.get('FIREBASE_API_KEY'),
        authDomain: configService.get('FIREBASE_AUTH_DOMAIN'),
        databaseURL: configService.get('FIREBASE_DATABASE_URL'),
        projectId: configService.get('FIREBASE_PROJECT_ID'),
        storageBucket: configService.get('FIREBASE_STORAGE_BUCKET'),
        messagingSenderId: configService.get('FIREBASE_MESSAGING_SENDER_ID'),
        appId: configService.get('FIREBASE_APP_ID'),
    });
    admin.initializeApp({
        credential: admin.credential.cert(adminConfig),
        databaseURL: configService.get('FIREBASE_DATABASE_URL'),
        storageBucket: 'gs://feelpay-backend.appspot.com/',
    });
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
    }));
    const config = new swagger_1.DocumentBuilder()
        .setTitle('Feelpay API')
        .setDescription('The Feelpay API description')
        .setVersion('1.0')
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, config);
    swagger_1.SwaggerModule.setup('api', app, document);
    await app.listen(3001).then(() => {
        console.log('Server running on port http://localhost:3001');
    });
}
bootstrap();
//# sourceMappingURL=main.js.map