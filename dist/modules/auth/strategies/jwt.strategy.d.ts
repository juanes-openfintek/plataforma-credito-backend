import { ConfigService } from '@nestjs/config';
import { Strategy } from 'passport-jwt';
import { User } from '../entities/user.entity';
import { JwtPayload } from '../interfaces/jwtPayload.interface';
import { Model } from 'mongoose';
declare const JwtStrategy_base: new (...args: any[]) => Strategy;
export declare class JwtStrategy extends JwtStrategy_base {
    private readonly userModel;
    constructor(userModel: Model<User>, configService: ConfigService);
    validate(payload: JwtPayload): Promise<User>;
}
export {};
