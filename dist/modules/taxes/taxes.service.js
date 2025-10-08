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
exports.TaxesService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const taxes_entity_1 = require("./entities/taxes.entity");
const exceptions_1 = require("@nestjs/common/exceptions");
const objectId_1 = require("../../helpers/objectId");
let TaxesService = class TaxesService {
    constructor(taxesModel) {
        this.taxesModel = taxesModel;
    }
    findAll(body) {
        return this.taxesModel.find(body).sort({ minAmount: 1 });
    }
    create(body) {
        return this.taxesModel.create(body);
    }
    async update(body) {
        try {
            const { id, ...rest } = body;
            const _id = (0, objectId_1.ObjectId)(id);
            const response = await this.taxesModel.findOneAndUpdate({ _id: _id }, rest, { new: true });
            if (!response)
                throw new common_1.InternalServerErrorException('taxes/taxes-not-found');
            return response;
        }
        catch (error) {
            this.handleDBError(error);
        }
    }
    async getByRange(value) {
        try {
            const response = await this.taxesModel.findOne({
                minAmount: { $lte: value },
                maxAmount: { $gte: value },
            });
            if (!response)
                throw new common_1.InternalServerErrorException('taxes/taxes-not-found');
            return response;
        }
        catch (error) {
            this.handleDBError(error);
        }
    }
    handleDBError(error) {
        if (error?.response?.message === 'taxes/taxes-not-found')
            throw new exceptions_1.NotFoundException(error.message);
        console.log(error);
        throw new common_1.InternalServerErrorException('Por favor revise los logs.');
    }
};
exports.TaxesService = TaxesService;
exports.TaxesService = TaxesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(taxes_entity_1.Taxes.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], TaxesService);
//# sourceMappingURL=taxes.service.js.map