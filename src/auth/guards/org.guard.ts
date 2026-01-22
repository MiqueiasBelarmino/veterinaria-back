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

    request.organizationMember = member;
    return true;
  }
}
