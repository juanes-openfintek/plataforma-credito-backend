"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailVerified = exports.META_EMAIL_VERIFIED = void 0;
const common_1 = require("@nestjs/common");
exports.META_EMAIL_VERIFIED = 'emailVerified';
const EmailVerified = () => {
    return (0, common_1.SetMetadata)(exports.META_EMAIL_VERIFIED, true);
};
exports.EmailVerified = EmailVerified;
//# sourceMappingURL=emailVerified.decorator.js.map