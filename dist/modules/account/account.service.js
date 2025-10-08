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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AccountService = void 0;
const common_1 = require("@nestjs/common");
const crypto = require("crypto");
let AccountService = class AccountService {
    constructor() {
        this.crypto = crypto;
    }
    hashBankNumber(bankNumber) {
        const hash = this.crypto
            .createHash('sha256')
            .update(bankNumber)
            .digest('hex');
        return hash;
    }
    encryptBankNumber(bankNumber, encryptionKey) {
        const cipher = this.crypto.createCipher('aes-256-cbc', encryptionKey);
        let encrypted = cipher.update(bankNumber, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        return encrypted;
    }
    decryptBankNumber(encryptedBankNumber, encryptionKey) {
        const decipher = this.crypto.createDecipher('aes-256-cbc', encryptionKey);
        let decrypted = decipher.update(encryptedBankNumber, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        return decrypted;
    }
};
exports.AccountService = AccountService;
exports.AccountService = AccountService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], AccountService);
//# sourceMappingURL=account.service.js.map