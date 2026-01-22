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
    await this.validateUser(email, password);

    const user = await this.usersService['prisma'].user.findUnique({
      where: { email },
      include: {
        organizationMembers: {
          include: { organization: true },
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException('Usuário não encontrado');
    }

    const memberships = (user.organizationMembers || [])
      .filter((member) => member.status === 'ACTIVE')
      .map((member) => ({
        organizationId: member.organizationId,
        organizationName: member.organization.name,
        role: member.role,
      }));

    return this.generateNeutralResponse(user, memberships);
  }

  async selectOrganization(userId: string, organizationId: string) {
    const user = await this.usersService.findOne(userId);

    if (user.isRoot) {
      throw new UnauthorizedException(
        'Use o endpoint de root para assumir uma organização',
      );
    }

    const member = await this.usersService['prisma'].organizationMember.findFirst(
      {
        where: {
          organizationId,
          userId,
          status: 'ACTIVE',
        },
        include: { organization: true },
      },
    );

    if (!member) {
      throw new UnauthorizedException('Acesso negado a esta organização');
    }

    return this.generateScopedToken(
      user,
      member.organizationId,
      member.role,
      member.organization.name,
    );
  }

  async getMe(user: any) {
    if (!user?.activeOrganizationId) {
      return {
        id: user.id,
        name: user.name,
        email: user.email,
        isRoot: user.isRoot,
        memberRole: user.memberRole,
        activeOrganization: null,
        assumedByRoot: user.assumedByRoot || false,
      };
    }

    const organization = await this.usersService['prisma'].organization.findUnique({
      where: { id: user.activeOrganizationId },
      select: { id: true, name: true },
    });

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      isRoot: user.isRoot,
      memberRole: user.memberRole,
      activeOrganization: organization,
      assumedByRoot: user.assumedByRoot || false,
    };
  }

  private generateNeutralResponse(
    user: any,
    memberships: Array<{ organizationId: string; organizationName: string; role: string }>,
  ) {
    const payload = {
      sub: user.id,
      name: user.name,
      email: user.email,
      isRoot: user.isRoot,
      type: 'neutral',
    };
    const token = this.jwtService.sign(payload);

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        isRoot: user.isRoot,
      },
      memberships,
      requiresOrgSelection: memberships.length > 0,
    };
  }

  generateScopedToken(
    user: any,
    organizationId: string,
    role: string,
    orgName: string,
    assumedByRoot = false,
  ) {
    const payload = {
      sub: user.id,
      name: user.name,
      email: user.email,
      activeOrganizationId: organizationId,
      memberRole: role,
      assumedByRoot,
      type: 'scoped',
      isRoot: user.isRoot,
    };
    const token = this.jwtService.sign(payload);

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        isRoot: user.isRoot,
        memberRole: role,
        activeOrganization: {
          id: organizationId,
          name: orgName,
          role,
        },
        assumedByRoot,
      },
    };
  }
}
