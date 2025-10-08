"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const auth_module_1 = require("./modules/auth/auth.module");
const mongoose_1 = require("@nestjs/mongoose");
const config_1 = require("@nestjs/config");
const auth_middleware_1 = require("./middleware/auth.middleware");
const credit_module_1 = require("./modules/credit/credit.module");
const taxes_module_1 = require("./modules/taxes/taxes.module");
const admin_module_1 = require("./modules/admin/admin.module");
const user_module_1 = require("./modules/user/user.module");
const disburser_module_1 = require("./modules/disburser/disburser.module");
const approver_module_1 = require("./modules/approver/approver.module");
const files_module_1 = require("./modules/files/files.module");
const account_module_1 = require("./modules/account/account.module");
let AppModule = class AppModule {
    configure(consumer) {
        consumer.apply(auth_middleware_1.AuthMiddleware).forRoutes('*');
    }
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot(),
            mongoose_1.MongooseModule.forRoot(process.env.MONGO_DATABASE_URL, {
                autoIndex: true,
            }),
            auth_module_1.AuthModule,
            credit_module_1.CreditModule,
            taxes_module_1.TaxesModule,
            admin_module_1.AdminModule,
            user_module_1.UserModule,
            disburser_module_1.DisburserModule,
            approver_module_1.ApproverModule,
            files_module_1.FilesModule,
            account_module_1.AccountModule,
        ],
        controllers: [app_controller_1.AppController],
        providers: [app_service_1.AppService],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map