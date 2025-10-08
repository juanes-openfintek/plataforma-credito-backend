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
exports.CreateCreditDto = void 0;
const class_validator_1 = require("class-validator");
const date_decorator_1 = require("../decorators/date.decorator");
const class_transformer_1 = require("class-transformer");
class CreateCreditDto {
}
exports.CreateCreditDto = CreateCreditDto;
__decorate([
    (0, class_validator_1.IsEmail)(),
    __metadata("design:type", String)
], CreateCreditDto.prototype, "email", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCreditDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCreditDto.prototype, "secondName", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCreditDto.prototype, "lastname", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCreditDto.prototype, "secondLastname", void 0);
__decorate([
    (0, class_validator_1.IsPhoneNumber)('CO'),
    __metadata("design:type", String)
], CreateCreditDto.prototype, "phoneNumber", void 0);
__decorate([
    (0, class_validator_1.IsDate)(),
    (0, class_transformer_1.Transform)(({ value }) => new Date(value)),
    (0, date_decorator_1.IsAdult)(),
    __metadata("design:type", Date)
], CreateCreditDto.prototype, "dateOfBirth", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCreditDto.prototype, "documentType", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCreditDto.prototype, "documentNumber", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCreditDto.prototype, "economicActivity", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCreditDto.prototype, "nameCompany", void 0);
__decorate([
    (0, class_validator_1.IsPhoneNumber)('CO'),
    __metadata("design:type", String)
], CreateCreditDto.prototype, "phoneNumberCompany", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCreditDto.prototype, "addressCompany", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCreditDto.prototype, "positionCompany", void 0);
__decorate([
    (0, class_validator_1.IsDate)(),
    (0, class_transformer_1.Transform)(({ value }) => new Date(value)),
    __metadata("design:type", Date)
], CreateCreditDto.prototype, "dateOfAdmission", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Matches)(/^[0-9]+(\.[0-9]{1,2})?$/, {
        message: 'El ingreso mensual no es válido',
    }),
    __metadata("design:type", String)
], CreateCreditDto.prototype, "monthlyIncome", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Matches)(/^[0-9]+(\.[0-9]{1,2})?$/, {
        message: 'El gasto mensual no es válido',
    }),
    __metadata("design:type", String)
], CreateCreditDto.prototype, "monthlyExpenses", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCreditDto.prototype, "experienceCredit", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCreditDto.prototype, "disburserMethod", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCreditDto.prototype, "nameReferencePersonal", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCreditDto.prototype, "parentescoReferencePersonal", void 0);
__decorate([
    (0, class_validator_1.IsPhoneNumber)('CO'),
    __metadata("design:type", String)
], CreateCreditDto.prototype, "phoneNumberReferencePersonal", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCreditDto.prototype, "departamentReferencePersonal", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCreditDto.prototype, "municipalityReferencePersonal", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCreditDto.prototype, "details", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCreditDto.prototype, "taxes", void 0);
//# sourceMappingURL=create-credit.dto.js.map