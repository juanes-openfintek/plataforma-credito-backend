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
exports.CreditSchema = exports.Credit = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const user_entity_1 = require("../../../modules/auth/entities/user.entity");
const interfaces_1 = require("../interfaces");
const taxes_entity_1 = require("../../../modules/taxes/entities/taxes.entity");
let Credit = class Credit {
};
exports.Credit = Credit;
__decorate([
    (0, mongoose_1.Prop)({ type: String, required: true, default: interfaces_1.CreditStatus.pending }),
    __metadata("design:type", String)
], Credit.prototype, "status", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Number, unique: true }),
    __metadata("design:type", Number)
], Credit.prototype, "code", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String }),
    __metadata("design:type", String)
], Credit.prototype, "details", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'User' }),
    __metadata("design:type", user_entity_1.User)
], Credit.prototype, "user", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'Taxes' }),
    __metadata("design:type", taxes_entity_1.Taxes)
], Credit.prototype, "taxes", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, required: true }),
    __metadata("design:type", String)
], Credit.prototype, "name", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, required: true }),
    __metadata("design:type", String)
], Credit.prototype, "secondName", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, required: true }),
    __metadata("design:type", String)
], Credit.prototype, "lastname", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, required: true }),
    __metadata("design:type", String)
], Credit.prototype, "secondLastname", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, required: true }),
    __metadata("design:type", String)
], Credit.prototype, "phoneNumber", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Date, required: true }),
    __metadata("design:type", Date)
], Credit.prototype, "dateOfBirth", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, required: true }),
    __metadata("design:type", String)
], Credit.prototype, "documentType", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, required: true }),
    __metadata("design:type", String)
], Credit.prototype, "documentNumber", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, required: true }),
    __metadata("design:type", String)
], Credit.prototype, "economicActivity", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, required: true }),
    __metadata("design:type", String)
], Credit.prototype, "nameCompany", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, required: true }),
    __metadata("design:type", String)
], Credit.prototype, "phoneNumberCompany", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, required: true }),
    __metadata("design:type", String)
], Credit.prototype, "addressCompany", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, required: true }),
    __metadata("design:type", String)
], Credit.prototype, "positionCompany", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Date, required: true }),
    __metadata("design:type", Date)
], Credit.prototype, "dateOfAdmission", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, required: true }),
    __metadata("design:type", String)
], Credit.prototype, "monthlyIncome", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, required: true }),
    __metadata("design:type", String)
], Credit.prototype, "monthlyExpenses", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, required: true }),
    __metadata("design:type", String)
], Credit.prototype, "experienceCredit", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, required: true }),
    __metadata("design:type", String)
], Credit.prototype, "disburserMethod", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, required: true }),
    __metadata("design:type", String)
], Credit.prototype, "nameReferencePersonal", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, required: true }),
    __metadata("design:type", String)
], Credit.prototype, "parentescoReferencePersonal", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, required: true }),
    __metadata("design:type", String)
], Credit.prototype, "phoneNumberReferencePersonal", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, required: true }),
    __metadata("design:type", String)
], Credit.prototype, "departamentReferencePersonal", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, required: true }),
    __metadata("design:type", String)
], Credit.prototype, "municipalityReferencePersonal", void 0);
exports.Credit = Credit = __decorate([
    (0, mongoose_1.Schema)()
], Credit);
exports.CreditSchema = mongoose_1.SchemaFactory.createForClass(Credit);
exports.CreditSchema.pre('save', async function (next) {
    try {
        if (this.isNew) {
            const CreditModel = this.constructor;
            const lastDocument = await CreditModel.findOne({}, 'code').sort('-code');
            this['code'] = (lastDocument?.code || 0) + 1;
        }
        next();
    }
    catch (error) {
        next(error);
    }
});
//# sourceMappingURL=credit.entity.js.map