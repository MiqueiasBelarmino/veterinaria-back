import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class OrgContextGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new UnauthorizedException('Usuário não autenticado');
    }

    if (!user.activeOrganizationId) {
      // If no active org, we can't check membership.
      // If the route strictly requires org context, this should fail.
      // But some routes might be hybrid? Assuming strict for now as per Hotfix 3 requirments.
      throw new UnauthorizedException('Esta ação requer uma organização ativa');
    }

    if (user.isRoot && user.assumedByRoot) {
      const organization = await this.prisma.organization.findUnique({
        where: { id: user.activeOrganizationId },
      });

      if (!organization) {
        throw new ForbiddenException('Organização não encontrada');
      }

      request.organization = organization;
      return true;
    }

    const member = await this.prisma.organizationMember.findFirst({
      where: {
        organizationId: user.activeOrganizationId,
        userId: user.id,
        status: 'ACTIVE',
      },
    });

    if (!member) {
      throw new ForbiddenException('Usuário não pertence à organização ativa');
    }

    // HOTFIX: Override the trusted role with the DB source of truth
    request.user.memberRole = member.role;
    request.organizationMember = member;

    return true;
  }
}
