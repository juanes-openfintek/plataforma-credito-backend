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
exports.CreditService = void 0;
const common_1 = require("@nestjs/common");
const credit_entity_1 = require("./entities/credit.entity");
const mongoose_1 = require("mongoose");
const mongoose_2 = require("@nestjs/mongoose");
const objectId_1 = require("../../helpers/objectId");
let CreditService = class CreditService {
    constructor(creditModel) {
        this.creditModel = creditModel;
    }
    create(user, createCreditDto) {
        return this.creditModel.create({
            user,
            ...createCreditDto,
        });
    }
    async updateCredit(body) {
        try {
            const { id, ...rest } = body;
            const _id = (0, objectId_1.ObjectId)(id);
            const response = await this.creditModel.findOneAndUpdate({ _id: _id }, rest, { new: true });
            if (!response)
                throw new common_1.InternalServerErrorException('credit/credit-not-found');
            return response;
        }
        catch (error) {
            this.handleDBError(error);
        }
    }
    createWithoutUser(createCreditDto) {
        return this.creditModel.create(createCreditDto);
    }
    getCreditsByUser(user) {
        return this.creditModel.find({ user });
    }
    getAllCredits(body = {}) {
        return this.creditModel.find(body);
    }
    handleDBError(error) {
        if (error?.response?.message === 'credit/credit-not-found')
            throw new common_1.NotFoundException(error.message);
        console.log(error);
        throw new common_1.InternalServerErrorException('Por favor revise los logs.');
    }
};
exports.CreditService = CreditService;
exports.CreditService = CreditService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_2.InjectModel)(credit_entity_1.Credit.name)),
    __metadata("design:paramtypes", [mongoose_1.Model])
], CreditService);
//# sourceMappingURL=credit.service.js.map