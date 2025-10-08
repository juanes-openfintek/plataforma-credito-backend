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
exports.JwtStrategy = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const passport_1 = require("@nestjs/passport");
const passport_jwt_1 = require("passport-jwt");
const user_entity_1 = require("../entities/user.entity");
const mongoose_1 = require("mongoose");
const mongoose_2 = require("@nestjs/mongoose");
const admin = require("firebase-admin");
let JwtStrategy = class JwtStrategy extends (0, passport_1.PassportStrategy)(passport_jwt_1.Strategy) {
    constructor(userModel, configService) {
        super({
            secretOrKey: configService
                .get('FIREBASE_PRIVATE_KEY')
                .replace(/\\n/g, '\n'),
            jwtFromRequest: passport_jwt_1.ExtractJwt.fromAuthHeaderAsBearerToken(),
        });
        this.userModel = userModel;
    }
    async validate(payload) {
        const { uid } = payload;
        const [userFirebase, userMongo] = await Promise.allSettled([
            Promise.resolve(admin.auth().getUser(uid)),
            Promise.resolve(this.userModel.findOne({ uid })),
        ]).then((results) => {
            return results.map((result) => {
                if (result.status === 'fulfilled') {
                    return result.value;
                }
                return null;
            });
        });
        if (!userFirebase || !userMongo)
            throw new common_1.UnauthorizedException('Token not valid');
        if (!userMongo?.isActive) {
            throw new common_1.UnauthorizedException('User is inactive, talk with an admin');
        }
        if (userFirebase.emailVerified && !userMongo?.emailVerified) {
            userMongo.emailVerified = true;
            await userMongo.save();
        }
        return userMongo;
    }
};
exports.JwtStrategy = JwtStrategy;
exports.JwtStrategy = JwtStrategy = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_2.InjectModel)(user_entity_1.User.name)),
    __metadata("design:paramtypes", [mongoose_1.Model,
        config_1.ConfigService])
], JwtStrategy);
//# sourceMappingURL=jwt.strategy.js.map