"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.IsAdult = exports.IsAdultConstraint = void 0;
const common_1 = require("@nestjs/common");
const class_validator_1 = require("class-validator");
let IsAdultConstraint = class IsAdultConstraint {
    validate(dateOfBirth, args) {
        if (!(dateOfBirth instanceof Date))
            return false;
        const today = new Date();
        let age = today.getFullYear() - dateOfBirth.getFullYear();
        if (today.getMonth() < dateOfBirth.getMonth() ||
            (today.getMonth() === dateOfBirth.getMonth() &&
                today.getDate() < dateOfBirth.getDate())) {
            age--;
        }
        return age >= 18;
    }
    defaultMessage(args) {
        return 'La fecha de nacimiento no es válida (debes ser mayor de 18 años)';
    }
};
exports.IsAdultConstraint = IsAdultConstraint;
exports.IsAdultConstraint = IsAdultConstraint = __decorate([
    (0, class_validator_1.ValidatorConstraint)({ name: 'isAdult', async: false }),
    (0, common_1.Injectable)()
], IsAdultConstraint);
function IsAdult(validationOptions) {
    return (object, propertyName) => {
        (0, class_validator_1.registerDecorator)({
            target: object.constructor,
            propertyName,
            options: validationOptions,
            constraints: [],
            validator: IsAdultConstraint,
        });
    };
}
exports.IsAdult = IsAdult;
//# sourceMappingURL=date.decorator.js.map