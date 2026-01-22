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
    // Payload contains: sub, name, email, activeOrganizationId?, memberRole?, type ('neutral'|'scoped')
    return {
      id: payload.sub,
      name: payload.name,
      email: payload.email,
      activeOrganizationId: payload.activeOrganizationId,
      memberRole: payload.memberRole,
      isRoot: payload.isRoot,
      assumedByRoot: payload.assumedByRoot || false,
      tokenType: payload.type,
    };
  }
}
