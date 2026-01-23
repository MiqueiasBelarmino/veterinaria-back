import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { getOrganizationIdFromRequest } from '../utils/auth-helpers';

@Injectable()
export class OrgScopeGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      return false;
    }

    const targetOrgId = getOrganizationIdFromRequest(request);

    // If the route doesn't have an organization ID parameter, this guard acts as a pass-through
    if (!targetOrgId) {
      return true;
    }

    // Accessing a scoped route requires an active organization context
    if (!user.activeOrganizationId) {
      throw new ForbiddenException(
        'Accessing organization resources requires an active organization context',
      );
    }

    // Strict check: Token's organization ID must match the requested organization ID
    if (user.activeOrganizationId !== targetOrgId) {
      throw new ForbiddenException(
        'Token organization scope does not match requested organization',
      );
    }

    return true;
  }
}
