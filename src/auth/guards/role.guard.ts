import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.get<string[]>(
      'roles',
      context.getHandler(),
    );

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('Usuário não autenticado');
    }

    if (user.isRoot || user.assumedByRoot) {
      return true;
    }

    if (user.memberRole === 'OWNER') {
      return true;
    }

    if (requiredRoles.length === 1 && requiredRoles[0] === 'CLIENT') {
      if (user.memberRole !== 'CLIENT') {
        throw new ForbiddenException('Acesso negado. Função necessária: CLIENT');
      }
      return true;
    }

    if (requiredRoles.includes(user.memberRole)) {
      return true;
    }

    const rolePriority: Record<string, number> = {
      CLIENT: 0,
      STAFF: 1,
      VET: 2,
      ADMIN: 3,
      OWNER: 4,
    };
    const requiredMax = Math.max(
      ...requiredRoles.map((role) => rolePriority[role] ?? -1),
    );
    const userRank = rolePriority[user.memberRole] ?? -1;

    if (userRank >= requiredMax) {
      return true;
    }

    throw new ForbiddenException(
      `Acesso negado. Função necessária: ${requiredRoles.join(', ')}`,
    );
  }
}
