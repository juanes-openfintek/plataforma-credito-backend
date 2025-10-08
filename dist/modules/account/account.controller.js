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
exports.AccountController = void 0;
const common_1 = require("@nestjs/common");
const account_service_1 = require("./account.service");
let AccountController = class AccountController {
    constructor(accountService) {
        this.accountService = accountService;
    }
    hashBankNumber(bankNumber) {
        const hashedBankNumber = this.accountService.hashBankNumber(bankNumber);
        return { hashedBankNumber };
    }
    encryptBankNumber(bankNumber) {
        const encryptionKey = process.env.ENCRYPTION_KEY;
        const encryptedBankNumber = this.accountService.encryptBankNumber(bankNumber, encryptionKey);
        return { encryptedBankNumber };
    }
    decryptBankNumber(encryptedBankNumber) {
        const encryptionKey = process.env.ENCRYPTION_KEY;
        const decryptedBankNumber = this.accountService.decryptBankNumber(encryptedBankNumber, encryptionKey);
        return { decryptedBankNumber };
    }
};
exports.AccountController = AccountController;
__decorate([
    (0, common_1.Post)('hash'),
    __param(0, (0, common_1.Body)('bankNumber')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AccountController.prototype, "hashBankNumber", null);
__decorate([
    (0, common_1.Post)('encrypt'),
    __param(0, (0, common_1.Body)('bankNumber')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AccountController.prototype, "encryptBankNumber", null);
__decorate([
    (0, common_1.Post)('decrypt'),
    __param(0, (0, common_1.Body)('encryptedBankNumber')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AccountController.prototype, "decryptBankNumber", null);
exports.AccountController = AccountController = __decorate([
    (0, common_1.Controller)('account'),
    __metadata("design:paramtypes", [account_service_1.AccountService])
], AccountController);
//# sourceMappingURL=account.controller.js.map