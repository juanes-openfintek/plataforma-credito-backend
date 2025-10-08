import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { User } from '../entities/user.entity';
import { JwtPayload } from '../interfaces/jwtPayload.interface';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';

import * as admin from 'firebase-admin';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<User>,

    configService: ConfigService,
  ) {
    super({
      secretOrKey: configService
        .get('FIREBASE_PRIVATE_KEY')
        .replace(/\\n/g, '\n'),
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    });
  }

  async validate(payload: JwtPayload): Promise<User> {
    const { uid } = payload;
    const [userFirebase, userMongo] = await Promise.allSettled([
      Promise.resolve(admin.auth().getUser(uid)),
      Promise.resolve(this.userModel.findOne({ uid })),
    ]).then((results: any) => {
      return results.map((result: any) => {
        if (result.status === 'fulfilled') {
          return result.value;
        }
        return null;
      });
    });

    if (!userFirebase || !userMongo)
      throw new UnauthorizedException('Token not valid');
    if (!userMongo?.isActive) {
      throw new UnauthorizedException('User is inactive, talk with an admin');
    }

    if (userFirebase.emailVerified && !userMongo?.emailVerified) {
      userMongo.emailVerified = true;
      await userMongo.save();
    }

    return userMongo;
  }
}
