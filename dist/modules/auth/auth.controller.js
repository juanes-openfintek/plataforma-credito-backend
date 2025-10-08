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
exports.AuthController = void 0;
const common_1 = require("@nestjs/common");
const auth_service_1 = require("./auth.service");
const dto_1 = require("./dto");
const decorators_1 = require("./decorators");
const user_entity_1 = require("./entities/user.entity");
const interfaces_1 = require("./interfaces");
const validEmail_decorator_1 = require("./decorators/validEmail.decorator");
const updateUser_dto_1 = require("./dto/updateUser.dto");
const swagger_1 = require("@nestjs/swagger");
let AuthController = class AuthController {
    constructor(authService) {
        this.authService = authService;
    }
    registerUser(registerUserDto) {
        return this.authService.register(registerUserDto);
    }
    loginUser(loginUserDto) {
        return this.authService.login(loginUserDto);
    }
    createUser(createUserDto) {
        return this.authService.registerRole(createUserDto);
    }
    validate(user) {
        return this.authService.authUser(user);
    }
    sendEmailVerification(req) {
        return this.authService.sendEmailVerification(req.headers['authorization'].split(' ')[1] ?? null);
    }
    sendPasswordResetEmail(email) {
        return this.authService.sendPasswordResetEmail(email);
    }
    updateUser(updateUserDto, user, req) {
        return this.authService.updateUser(user, updateUserDto, req.headers['authorization'].split(' ')[1] ?? null);
    }
    updateUserAdmin(updateUserDto) {
        return this.authService.updateUserAdmin(updateUserDto);
    }
    private() {
        return {
            message: 'This is a private route',
        };
    }
    privateRoute2(user) {
        return {
            ok: true,
            user,
        };
    }
    privateRoute3(user) {
        return {
            ok: true,
            user,
        };
    }
};
exports.AuthController = AuthController;
__decorate([
    (0, common_1.Post)('register'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.RegisterUserDto]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "registerUser", null);
__decorate([
    (0, common_1.Post)('login'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.LoginUserDto]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "loginUser", null);
__decorate([
    (0, common_1.Post)('create-user'),
    (0, decorators_1.Auth)(interfaces_1.ValidRoles.admin),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.RegisterUserRoleDto]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "createUser", null);
__decorate([
    (0, common_1.Get)('validate'),
    (0, decorators_1.Auth)(),
    __param(0, (0, decorators_1.GetUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.User]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "validate", null);
__decorate([
    (0, common_1.Post)('verify-email'),
    (0, decorators_1.Auth)(),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "sendEmailVerification", null);
__decorate([
    (0, common_1.Post)('reset-email'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.UserEmailDto]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "sendPasswordResetEmail", null);
__decorate([
    (0, common_1.Put)('update-user'),
    (0, decorators_1.Auth)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, decorators_1.GetUser)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.UpdateUserDto,
        user_entity_1.User, Object]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "updateUser", null);
__decorate([
    (0, common_1.Put)('update-user-admin'),
    (0, decorators_1.Auth)(interfaces_1.ValidRoles.admin),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [updateUser_dto_1.UpdateUserAdminDto]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "updateUserAdmin", null);
__decorate([
    (0, common_1.Get)('private'),
    (0, decorators_1.Auth)(interfaces_1.ValidRoles.user),
    (0, validEmail_decorator_1.ValidEmail)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "private", null);
__decorate([
    (0, common_1.Get)('private2'),
    (0, decorators_1.Auth)(interfaces_1.ValidRoles.disburser, interfaces_1.ValidRoles.admin),
    __param(0, (0, decorators_1.GetUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.User]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "privateRoute2", null);
__decorate([
    (0, common_1.Get)('private3'),
    (0, decorators_1.Auth)(interfaces_1.ValidRoles.admin),
    __param(0, (0, decorators_1.GetUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.User]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "privateRoute3", null);
exports.AuthController = AuthController = __decorate([
    (0, swagger_1.ApiTags)('Auth'),
    (0, common_1.Controller)('auth'),
    __metadata("design:paramtypes", [auth_service_1.AuthService])
], AuthController);
//# sourceMappingURL=auth.controller.js.map