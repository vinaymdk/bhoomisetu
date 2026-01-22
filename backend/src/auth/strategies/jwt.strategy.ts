// import { Injectable, UnauthorizedException } from '@nestjs/common';
// import { PassportStrategy } from '@nestjs/passport';
// import { ExtractJwt, Strategy } from 'passport-jwt';
// import { UsersService } from '../../users/users.service';

// export interface JwtPayload {
//   sub: string; // user id
//   email?: string;
//   phone?: string;
//   roles?: string[];
//   iat?: number;
//   exp?: number;
// }

// @Injectable()
// export class JwtStrategy extends PassportStrategy(Strategy) {
//   constructor(private readonly usersService: UsersService) {
//     const extractor = ExtractJwt.fromExtractors([
//       ExtractJwt.fromAuthHeaderAsBearerToken(),
//       (req) => {
//         if (!req) return null;
//         const headerToken = req.headers?.['x-access-token'];
//         if (typeof headerToken === 'string' && headerToken.trim()) {
//           return headerToken.trim();
//         }
//         const queryToken = req.query?.accessToken;
//         if (typeof queryToken === 'string' && queryToken.trim()) {
//           return queryToken.trim();
//         }
//         return null;
//       },
//     ]);

//     super({
//       jwtFromRequest: extractor,
//       ignoreExpiration: false,
//       secretOrKey: process.env.JWT_SECRET || 'CHANGE_THIS_SECRET_IN_PRODUCTION',
//     });
//   }

//   async validate(payload: JwtPayload) {
//     const user = await this.usersService.findById(payload.sub);
//     if (!user || user.status !== 'active') {
//       throw new UnauthorizedException('User not found or inactive');
//     }

//     // Load roles from database (more secure than trusting token payload)
//     const roles = await this.usersService.getUserRoles(user.id);

//     // Attach user and roles to request object
//     return {
//       userId: user.id,
//       user,
//       roles,
//     };
//   }
// }

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersService } from '../../users/users.service';
import { ConfigService } from '@nestjs/config';

export interface JwtPayload {
  sub: string;
  email?: string;
  phone?: string;
  roles?: string[];
  iat?: number;
  exp?: number;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly usersService: UsersService,
    private readonly configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        ExtractJwt.fromAuthHeaderAsBearerToken(),
        (req) => {
          if (!req) return null;
          const headerToken = req.headers?.['x-access-token'];
          if (typeof headerToken === 'string' && headerToken.trim()) {
            return headerToken.trim();
          }
          const queryToken = req.query?.accessToken;
          if (typeof queryToken === 'string' && queryToken.trim()) {
            return queryToken.trim();
          }
          return null;
        },
      ]),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET'),
    });
  }

  async validate(payload: JwtPayload) {
    const user = await this.usersService.findById(payload.sub);

    if (!user || user.status !== 'active') {
      throw new UnauthorizedException('User not found or inactive');
    }

    const roles = await this.usersService.getUserRoles(user.id);

    return {
      userId: user.id,
      user,
      roles,
    };
  }
}
