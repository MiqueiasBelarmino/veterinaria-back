import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET as string,
    });
  }

  async validate(payload: any) {
    // Payload contains: sub, name, email, organizationId?, role?, type ('neutral'|'scoped')
    return {
      id: payload.sub,
      name: payload.name,
      email: payload.email,
      role: payload.role || (payload.isSuperAdmin ? 'ROOT' : 'USER'), 
      // If role is missing (neutral token), default to USER or check isSuperAdmin.
      // Ideally, a neutral token should probably provide minimal access.
      organizationId: payload.organizationId,
      isSuperAdmin: payload.isSuperAdmin,
      tokenType: payload.type
    };
  }
}
