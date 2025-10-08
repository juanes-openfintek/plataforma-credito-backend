"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ValidEmail = void 0;
const common_1 = require("@nestjs/common");
const emailVerified_decorator_1 = require("./emailVerified.decorator");
const emailVerified_guard_1 = require("../guards/emailVerified.guard");
const passport_1 = require("@nestjs/passport");
function ValidEmail() {
    return (0, common_1.applyDecorators)((0, emailVerified_decorator_1.EmailVerified)(), (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt'), emailVerified_guard_1.EmailVerifiedGuard));
}
exports.ValidEmail = ValidEmail;
//# sourceMappingURL=validEmail.decorator.js.map