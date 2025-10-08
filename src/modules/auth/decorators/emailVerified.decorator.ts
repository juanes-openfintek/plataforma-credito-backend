import { SetMetadata } from '@nestjs/common';

export const META_EMAIL_VERIFIED = 'emailVerified';

export const EmailVerified = () => {
  return SetMetadata(META_EMAIL_VERIFIED, true);
};
