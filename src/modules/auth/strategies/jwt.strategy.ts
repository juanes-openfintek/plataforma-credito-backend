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
  private configService: ConfigService;

  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<User>,

    configService: ConfigService,
  ) {
    super({
      secretOrKeyProvider: (request: any, rawJwtToken: any, done: any) => {
        // Intentar decodificar el token para ver si es Firebase o JWT estándar
        try {
          const decoded = JSON.parse(
            Buffer.from(rawJwtToken.split('.')[1], 'base64').toString()
          );
          
          // Si tiene 'sub' y no tiene 'uid', es un token JWT estándar (comercial)
          if (decoded.sub && !decoded.uid) {
            done(null, configService.get('JWT_SECRET'));
          } else {
            // Token de Firebase
            done(null, configService.get('FIREBASE_PRIVATE_KEY').replace(/\\n/g, '\n'));
          }
        } catch (error) {
          // En caso de error, usar la clave de Firebase por defecto
          done(null, configService.get('FIREBASE_PRIVATE_KEY').replace(/\\n/g, '\n'));
        }
      },
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    });
    this.configService = configService;
  }

  async validate(payload: JwtPayload): Promise<User> {
    // Determinar si es un token de comercial (tiene 'sub' en lugar de 'uid')
    const isCommercialToken = payload.sub && !payload.uid;
    
    if (isCommercialToken) {
      // Validación para usuarios comerciales (JWT estándar)
      const userId = payload.sub;
      const userMongo = await this.userModel.findById(userId);

      if (!userMongo) {
        throw new UnauthorizedException('Token not valid');
      }

      if (!userMongo.isActive) {
        throw new UnauthorizedException('User is inactive, talk with an admin');
      }

      return userMongo;
    } else {
      // Validación para usuarios de Firebase (legacy)
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
}
