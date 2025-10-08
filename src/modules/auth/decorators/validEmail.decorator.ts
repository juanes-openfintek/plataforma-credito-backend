import { applyDecorators, UseGuards } from '@nestjs/common';
import { EmailVerified } from './emailVerified.decorator';
import { EmailVerifiedGuard } from '../guards/emailVerified.guard';
import { AuthGuard } from '@nestjs/passport';

export function ValidEmail() {
  return applyDecorators(
    EmailVerified(),
    UseGuards(AuthGuard('jwt'), EmailVerifiedGuard),
  );
}
