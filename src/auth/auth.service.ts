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
    // 1. Validate credentials
    const validUser = await this.validateUser(email, password);
    
    // 2. Fetch full profile with memberships and client records
    const user = await this.usersService['prisma'].user.findUnique({
        where: { email },
        include: {
            organizationMembers: {
                include: { organization: true }
            },
            clients: {
                include: { organization: true }
            }
            // vet: true // Removed as we rely on context
        }
    });

    if (!user) {
        throw new UnauthorizedException('Usuário não encontrado');
    }

    const memberships = user.organizationMembers || [];
    const activeMembers = memberships.filter(m => m.status === 'ACTIVE');
    const clients = user.clients || [];

    // Combine contexts
    const allContexts = [
        ...activeMembers.map(m => ({
            organizationId: m.organizationId,
            organizationName: m.organization.name,
            role: m.role,
            type: 'MEMBER'
        })),
        ...clients.map(c => ({
            organizationId: c.organizationId,
            organizationName: c.organization.name,
            role: 'CLIENT',
            type: 'CLIENT'
        }))
    ];

    // 3. Determine Login Flow
    // Case A: No organizations -> Neutral Token
    if (allContexts.length === 0) {
        if (user.isSuperAdmin) {
             return this.generateToken(user, null, 'ROOT', 'SYSTEM');
        }
        return this.generateNeutralResponse(user, []);
    }

    // Case B: Single Organization -> Auto-Select -> Scoped Token
    if (allContexts.length === 1) {
        const ctx = allContexts[0];
        return this.generateToken(user, ctx.organizationId, ctx.role, ctx.organizationName);
    }

    // Case C: Multiple Organizations -> List Selection -> Neutral Token
    return this.generateNeutralResponse(user, allContexts);
  }

  async selectOrganization(userId: string, organizationId: string) {
      // Fetch user with memberships
      const user = await this.usersService.findOne(userId); // Need simple find first
      if (user.isSuperAdmin) {
           // Root can access any organization.
           // We could verify organization exists here if we had OrgService or simpler Query
           // For now, we assume it exists or fail later. 
           // We assign 'OWNER' role for full access within the org context.
           const org = await this.usersService['prisma'].organization.findUnique({ where: { id: organizationId } });
           if (!org) throw new UnauthorizedException('Organização não encontrada');
           
           return this.generateToken(user, organizationId, 'OWNER', org.name);
      }

      // Actually we need to verify membership
      // optimization: We could do a direct Prisma check on OrganizationMember
      // 1. Check Organization Member
      const member = await this.usersService['prisma'].organizationMember.findUnique({
          where: {
              organizationId_userId: {
                  organizationId,
                  userId
              }
          },
          include: { organization: true }
      });

      if (member && member.status === 'ACTIVE') {
          return this.generateToken(user, organizationId, member.role, member.organization.name);
      }

      // 2. Check Client Record
      const client = await this.usersService['prisma'].client.findFirst({
          where: { userId, organizationId },
          include: { organization: true }
      });

      if (client) {
          return this.generateToken(user, organizationId, 'CLIENT', client.organization.name);
      }

      throw new UnauthorizedException('Acesso negado a esta organização');
  }

  private generateNeutralResponse(user: any, memberships: any[]) {
      const payload = {
          sub: user.id,
          name: user.name,
          email: user.email,
          isSuperAdmin: user.isSuperAdmin,
          type: 'neutral'
      };
      const token = this.jwtService.sign(payload);
      
      return {
          token,
          user: {
              id: user.id,
              name: user.name,
              email: user.email,
          },
          memberships: memberships.map(m => ({
              organizationId: m.organizationId,
              organizationName: m.organization.name,
              role: m.role
          })),
          requiresOrgSelection: memberships.length > 0
      };
  }

  private generateToken(user: any, organizationId: string | null, role: string, orgName: string) {
      const payload = {
          sub: user.id,
          name: user.name,
          email: user.email,
          role: role,
          organizationId: organizationId,
          type: 'scoped',
          isSuperAdmin: user.isSuperAdmin
      };
      const token = this.jwtService.sign(payload);

      return {
          token,
          user: {
              id: user.id,
              name: user.name,
              email: user.email,
              currentOrganization: {
                  id: organizationId,
                  name: orgName,
                  role: role
              }
          }
      };
  }
}
