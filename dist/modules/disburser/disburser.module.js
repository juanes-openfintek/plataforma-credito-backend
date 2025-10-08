"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DisburserModule = void 0;
const common_1 = require("@nestjs/common");
const disburser_service_1 = require("./disburser.service");
const disburser_controller_1 = require("./disburser.controller");
const credit_service_1 = require("../credit/credit.service");
const mongoose_1 = require("@nestjs/mongoose");
const credit_entity_1 = require("../credit/entities/credit.entity");
let DisburserModule = class DisburserModule {
};
exports.DisburserModule = DisburserModule;
exports.DisburserModule = DisburserModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([{ name: credit_entity_1.Credit.name, schema: credit_entity_1.CreditSchema }]),
        ],
        controllers: [disburser_controller_1.DisburserController],
        providers: [disburser_service_1.DisburserService, credit_service_1.CreditService],
    })
], DisburserModule);
//# sourceMappingURL=disburser.module.js.map