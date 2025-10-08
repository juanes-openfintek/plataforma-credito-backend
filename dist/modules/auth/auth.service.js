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
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const exceptions_1 = require("@nestjs/common/exceptions");
const jwt_1 = require("@nestjs/jwt");
const mongoose_1 = require("@nestjs/mongoose");
const user_entity_1 = require("./entities/user.entity");
const mongoose_2 = require("mongoose");
const interfaces_1 = require("./interfaces");
const auth_1 = require("firebase/auth");
const admin = require("firebase-admin");
let AuthService = class AuthService {
    constructor(userModel, jwtService) {
        this.userModel = userModel;
        this.jwtService = jwtService;
    }
    async register(registerUserDto) {
        try {
            const { password, email } = registerUserDto;
            const roles = [interfaces_1.ValidRoles.user];
            const auth = (0, auth_1.getAuth)();
            const userCredentials = await (0, auth_1.createUserWithEmailAndPassword)(auth, email, password);
            await this.userModel.create({
                uid: userCredentials.user.uid,
                email,
                roles,
            });
            (0, auth_1.sendEmailVerification)(userCredentials.user)
                .then(() => {
                console.log('Email verification sent!');
            })
                .catch((error) => {
                console.log(error);
            });
            const token = await admin
                .auth()
                .createCustomToken(userCredentials.user.uid);
            return { token: token };
        }
        catch (error) {
            this.handleDBError(error);
        }
    }
    async registerRole(registerUserDto) {
        try {
            const { name, password, email, lastname } = registerUserDto;
            let roles = [interfaces_1.ValidRoles.user];
            if (registerUserDto?.roles) {
                if (!registerUserDto.roles.includes(interfaces_1.ValidRoles.user)) {
                    registerUserDto.roles.push(interfaces_1.ValidRoles.user);
                }
                roles = registerUserDto.roles;
            }
            const auth = (0, auth_1.getAuth)();
            const userCredentials = await (0, auth_1.createUserWithEmailAndPassword)(auth, email, password);
            await this.userModel.create({
                uid: userCredentials.user.uid,
                name,
                lastname,
                email,
                roles,
            });
            (0, auth_1.sendEmailVerification)(userCredentials.user)
                .then(() => {
                console.log('Email verification sent!');
            })
                .catch((error) => {
                console.log(error);
            });
            const token = await admin
                .auth()
                .createCustomToken(userCredentials.user.uid);
            return { token: token };
        }
        catch (error) {
            this.handleDBError(error);
        }
    }
    async sendEmailVerification(token) {
        const auth = (0, auth_1.getAuth)();
        if (!token)
            throw new common_1.UnauthorizedException('Token not valid');
        try {
            const user = await (0, auth_1.signInWithCustomToken)(auth, token);
            await (0, auth_1.sendEmailVerification)(user.user).then(() => {
                console.log('Email verification sent!');
            });
            return { message: 'Email verification sent!' };
        }
        catch (error) {
            this.handleDBError(error);
        }
    }
    async sendPasswordResetEmail({ email }) {
        const auth = (0, auth_1.getAuth)();
        try {
            await (0, auth_1.sendPasswordResetEmail)(auth, email).then(() => {
                console.log('Email for reset password sent!');
            });
            return { message: 'Email for reset password sent!' };
        }
        catch (error) {
            this.handleDBError(error);
        }
    }
    async login(loginUserDto) {
        const { email, password } = loginUserDto;
        const auth = (0, auth_1.getAuth)();
        try {
            const user = await (0, auth_1.signInWithEmailAndPassword)(auth, email, password);
            const token = await admin.auth().createCustomToken(user.user.uid);
            return { token: token };
        }
        catch (error) {
            this.handleDBError(error);
        }
    }
    async authUser(user) {
        const token = await admin.auth().createCustomToken(user.uid);
        return { ...user.toJSON(), token };
    }
    async updateUser(user, updateUserDto, token) {
        let emailVerified = false;
        try {
            if (updateUserDto?.email) {
                const auth = (0, auth_1.getAuth)();
                const userFirebase = await (0, auth_1.signInWithCustomToken)(auth, token);
                await (0, auth_1.updateEmail)(userFirebase.user, updateUserDto.email);
                console.log('Email updated!');
                await admin.auth().updateUser(userFirebase.user.uid, {
                    emailVerified: false,
                });
                emailVerified = true;
            }
            const updatedUser = await this.userModel.findOneAndUpdate({ uid: user.uid }, {
                ...updateUserDto,
                ...(emailVerified ? { emailVerified: false } : null),
            }, { new: true });
            return updatedUser;
        }
        catch (error) {
            this.handleDBError(error);
        }
    }
    async updateUserAdmin(updateUserDto) {
        const { uid, ...updateUser } = updateUserDto;
        try {
            const updatedUser = await this.userModel.findOneAndUpdate({ uid }, {
                ...updateUser,
            }, { new: true });
            if (!updatedUser)
                throw new common_1.InternalServerErrorException('auth/user-not-found');
            return updatedUser;
        }
        catch (error) {
            this.handleDBError(error);
        }
    }
    handleDBError(error) {
        if (error?.code === 'auth/wrong-password')
            throw new common_1.UnauthorizedException(error.message);
        if (error?.code === 'auth/user-disabled')
            throw new common_1.UnauthorizedException(error.message);
        if (error?.code === 'auth/email-already-exists')
            throw new exceptions_1.ConflictException(error.message);
        if (error?.code === 'auth/email-already-in-use')
            throw new exceptions_1.ConflictException(error.message);
        if (error?.code === 'auth/invalid-email')
            throw new exceptions_1.ConflictException(error.message);
        if (error?.response?.message === 'auth/user-not-found')
            throw new exceptions_1.NotFoundException(error.message);
        console.log(error);
        throw new common_1.InternalServerErrorException('Por favor revise los logs.');
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(user_entity_1.User.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        jwt_1.JwtService])
], AuthService);
//# sourceMappingURL=auth.service.js.map