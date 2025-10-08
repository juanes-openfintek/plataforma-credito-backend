"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DisburserController = void 0;
const common_1 = require("@nestjs/common");
const disburser_service_1 = require("./disburser.service");
const decorators_1 = require("../auth/decorators");
const interfaces_1 = require("../auth/interfaces");
const credit_service_1 = require("../credit/credit.service");
const update_credit_dto_1 = require("../credit/dto/update-credit.dto");
let DisburserController = class DisburserController {
    constructor(disburserService, creditService) {
        this.disburserService = disburserService;
        this.creditService = creditService;
    }
    getAllCredits(body) {
        return this.creditService.getAllCredits(body);
    }
    updateCredit(body) {
        return this.creditService.updateCredit(body);
    }
};
exports.DisburserController = DisburserController;
__decorate([
    (0, common_1.Get)('get-all-credits'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [update_credit_dto_1.GetCredit]),
    __metadata("design:returntype", void 0)
], DisburserController.prototype, "getAllCredits", null);
__decorate([
    (0, common_1.Put)('update-credit'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [update_credit_dto_1.UpdateCreditsDto]),
    __metadata("design:returntype", void 0)
], DisburserController.prototype, "updateCredit", null);
exports.DisburserController = DisburserController = __decorate([
    (0, common_1.Controller)('disburser'),
    (0, decorators_1.Auth)(interfaces_1.ValidRoles.disburser, interfaces_1.ValidRoles.admin),
    __metadata("design:paramtypes", [disburser_service_1.DisburserService,
        credit_service_1.CreditService])
], DisburserController);
//# sourceMappingURL=disburser.controller.js.map