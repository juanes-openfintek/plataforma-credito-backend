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
exports.CreditController = void 0;
const common_1 = require("@nestjs/common");
const credit_service_1 = require("./credit.service");
const create_credit_dto_1 = require("./dto/create-credit.dto");
const interfaces_1 = require("../../modules/auth/interfaces");
const decorators_1 = require("../../modules/auth/decorators");
const user_entity_1 = require("../../modules/auth/entities/user.entity");
const objectId_1 = require("../../helpers/objectId");
let CreditController = class CreditController {
    constructor(creditService) {
        this.creditService = creditService;
    }
    create(createCreditDto, user) {
        return this.creditService.create((0, objectId_1.ObjectId)(user.id), createCreditDto);
    }
    createWithoutUser(createCreditDto) {
        return this.creditService.createWithoutUser(createCreditDto);
    }
    getCreditsByUser(user) {
        return this.creditService.getCreditsByUser((0, objectId_1.ObjectId)(user.id));
    }
};
exports.CreditController = CreditController;
__decorate([
    (0, common_1.Post)('create'),
    (0, decorators_1.Auth)(interfaces_1.ValidRoles.user),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, decorators_1.GetUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_credit_dto_1.CreateCreditDto, user_entity_1.User]),
    __metadata("design:returntype", void 0)
], CreditController.prototype, "create", null);
__decorate([
    (0, common_1.Post)('create-without-user'),
    (0, decorators_1.Auth)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_credit_dto_1.CreateCreditDto]),
    __metadata("design:returntype", void 0)
], CreditController.prototype, "createWithoutUser", null);
__decorate([
    (0, common_1.Get)('get-credits-by-user'),
    (0, decorators_1.Auth)(interfaces_1.ValidRoles.user),
    __param(0, (0, decorators_1.GetUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.User]),
    __metadata("design:returntype", void 0)
], CreditController.prototype, "getCreditsByUser", null);
exports.CreditController = CreditController = __decorate([
    (0, common_1.Controller)('credit'),
    __metadata("design:paramtypes", [credit_service_1.CreditService])
], CreditController);
//# sourceMappingURL=credit.controller.js.map