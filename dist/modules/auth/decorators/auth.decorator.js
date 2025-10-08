"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Auth = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const userRole_guard_1 = require("../guards/userRole.guard");
const roleProtected_decorator_1 = require("./roleProtected.decorator");
function Auth(...roles) {
    return (0, common_1.applyDecorators)((0, roleProtected_decorator_1.RoleProtected)(...roles), (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt'), userRole_guard_1.UserRoleGuard));
}
exports.Auth = Auth;
//# sourceMappingURL=auth.decorator.js.map