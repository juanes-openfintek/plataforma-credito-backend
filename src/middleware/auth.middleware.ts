import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(private configService: ConfigService) {}

  use(req: Request, res: Response, next: NextFunction) {
    const expectedToken = this.configService.get('NESTJS_TOKEN');
    const token = req.headers['x-security-token'];

    if (!token || token !== expectedToken) {
      return res
        .status(401)
        .json({ message: 'Invalid or missing x-security-token header' });
    }

    next();
  }
}
