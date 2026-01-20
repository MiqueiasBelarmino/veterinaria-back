import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRole = this.reflector.get<string>('role', context.getHandler());

    if (!requiredRole) {
      return true; // No role required
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('Usuário não autenticado');
    }

    // ROOT can access everything
    if (user.role === 'ROOT') {
      return true;
    }

    if (user.role !== requiredRole) {
      throw new ForbiddenException(
        `Acesso negado. Função necessária: ${requiredRole}, sua função: ${user.role}`,
      );
    }

    return true;
  }
}
