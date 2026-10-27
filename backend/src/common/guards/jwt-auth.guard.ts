import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  private readonly secret = process.env.JWT_SECRET || 'filadelfia-secret-key';

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization || request.headers.Authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Token de autenticación requerido.');
    }

    const token = authHeader.substring(7);
    try {
      const payload = jwt.verify(token, this.secret) as any;
      request.user = payload;
      return true;
    } catch (e: any) {
      throw new UnauthorizedException('Token inválido o expirado.');
    }
  }
}
