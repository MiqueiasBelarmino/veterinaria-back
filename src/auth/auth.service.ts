import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);

    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    return user;
  }

  async login(email: string, password: string) {
    // Validate credentials (basic user check)
    const validUser = await this.validateUser(email, password);
    
    // Fetch full profile to determin organization context
    const user = await this.usersService.findWithProfile(email);

    if (!user) {
        throw new UnauthorizedException('Usuário não encontrado');
    }

    let organizationId: string | null = null;

    if (user.role === 'VET' && user.vet && (user.vet as any).organizationId) {
      organizationId = (user.vet as any).organizationId;
    } else if (user.role === 'CLIENT' && user.client && (user.client as any).organizationId) {
      organizationId = (user.client as any).organizationId;
    } else if (user.organizationMembers && user.organizationMembers.length > 0) {
      organizationId = (user.organizationMembers[0] as any).organizationId;
    }

    const payload = {
      sub: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      organizationId,
    };
    const token = this.jwtService.sign(payload);

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        organizationId,
      },
    };
  }
}
