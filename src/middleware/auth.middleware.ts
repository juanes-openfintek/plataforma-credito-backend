import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(private configService: ConfigService) {}

  use(req: Request, res: Response, next: NextFunction) {
    // Rutas públicas que no requieren validación del token
    const publicRoutes = ['/auth', '/taxes'];
    const isPublicRoute = publicRoutes.some(route => req.path.startsWith(route));
    
    if (isPublicRoute) {
      return next();
    }

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
