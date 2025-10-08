import {
  Injectable,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { User } from '../entities/user.entity';
import { META_EMAIL_VERIFIED } from '../decorators/emailVerified.decorator';

@Injectable()
export class EmailVerifiedGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const emailVerified: boolean = this.reflector.get(
      META_EMAIL_VERIFIED,
      context.getHandler(),
    );

    if (!emailVerified) return true;

    const req = context.switchToHttp().getRequest();
    const user = req.user as User;

    if (!user) throw new BadRequestException('User not found');

    if (!user.emailVerified) {
      throw new ForbiddenException(
        `User ${user.name} needs a verified email to access this route`,
      );
    }

    return true;
  }
}
