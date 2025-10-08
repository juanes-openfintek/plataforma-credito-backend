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
exports.TaxesController = void 0;
const common_1 = require("@nestjs/common");
const taxes_service_1 = require("./taxes.service");
const update_taxes_dto_1 = require("./dto/update-taxes.dto");
const create_taxes_dto_1 = require("./dto/create-taxes.dto");
const interfaces_1 = require("../auth/interfaces");
const decorators_1 = require("../auth/decorators");
let TaxesController = class TaxesController {
    constructor(taxesService) {
        this.taxesService = taxesService;
    }
    findAll(body) {
        return this.taxesService.findAll(body);
    }
    create(body) {
        return this.taxesService.create(body);
    }
    getByRange(value) {
        return this.taxesService.getByRange(value);
    }
    update(body) {
        return this.taxesService.update(body);
    }
};
exports.TaxesController = TaxesController;
__decorate([
    (0, common_1.Get)(),
    (0, decorators_1.Auth)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [update_taxes_dto_1.GetTaxesDto]),
    __metadata("design:returntype", void 0)
], TaxesController.prototype, "findAll", null);
__decorate([
    (0, decorators_1.Auth)(interfaces_1.ValidRoles.admin),
    (0, common_1.Post)('create'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_taxes_dto_1.CreateTaxesDto]),
    __metadata("design:returntype", void 0)
], TaxesController.prototype, "create", null);
__decorate([
    (0, decorators_1.Auth)(),
    (0, common_1.Get)('get-by-range'),
    __param(0, (0, common_1.Body)('value')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], TaxesController.prototype, "getByRange", null);
__decorate([
    (0, decorators_1.Auth)(interfaces_1.ValidRoles.admin),
    (0, common_1.Put)('update'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [update_taxes_dto_1.UpdateTaxesDto]),
    __metadata("design:returntype", void 0)
], TaxesController.prototype, "update", null);
exports.TaxesController = TaxesController = __decorate([
    (0, common_1.Controller)('taxes'),
    __metadata("design:paramtypes", [taxes_service_1.TaxesService])
], TaxesController);
//# sourceMappingURL=taxes.controller.js.map