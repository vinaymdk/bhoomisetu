import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    // Check if route is marked as public
    const isPublic = this.reflector.getAllAndOverride<boolean>('isPublic', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    return super.canActivate(context);
  }

  handleRequest(err: any, user: any, info: any, context: ExecutionContext) {
    if (err || !user) {
      const request = context.switchToHttp().getRequest();
      const authHeader = request.headers?.authorization;
      const headerToken = request.headers?.['x-access-token'];
      const queryToken = request.query?.accessToken;
      const rawToken =
        (typeof authHeader === 'string' && authHeader.startsWith('Bearer ')
          ? authHeader.slice(7)
          : null) ||
        (typeof headerToken === 'string' ? headerToken : null) ||
        (typeof queryToken === 'string' ? queryToken : null) ||
        null;
      const tokenPreview = rawToken ? `${rawToken.slice(0, 12)}...` : 'none';
      const reason = info?.message || err?.message || 'Unauthorized';
      throw new UnauthorizedException(`Unauthorized: ${reason}. token=${tokenPreview}`);
    }
    return user;
  }
}
