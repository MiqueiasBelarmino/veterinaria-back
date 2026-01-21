import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { OrganizationService } from '../../organizations/organizations.service';

export interface RequiredRole {
  roles?: string[];
  allowOwner?: boolean;
  allowAdmin?: boolean;
}

@Injectable()
export class OrganizationMemberGuard implements CanActivate {
  constructor(private organizationService: OrganizationService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const organizationId = request.params.id || request.params.organizationId;
    const userId = request.user?.id;
    const requiredRole: RequiredRole = request.requiredOrgRole || {};

    if (!organizationId) {
      throw new BadRequestException('Organization ID is required');
    }

    if (!userId) {
      throw new ForbiddenException('User is not authenticated');
    }

    try {
      const member = await this.organizationService.checkMembership(
        organizationId,
        userId,
      );

      // If specific roles are required, check if user has one of them
      if (requiredRole.roles && requiredRole.roles.length > 0) {
        if (!requiredRole.roles.includes(member.role)) {
          throw new ForbiddenException(
            `This action requires one of the following roles: ${requiredRole.roles.join(
              ', ',
            )}`,
          );
        }
      }

      // If owner is required
      if (requiredRole.allowOwner === false && member.role === 'owner') {
        throw new ForbiddenException(
          'Owner role is not allowed for this action',
        );
      }

      // If admin is required
      if (requiredRole.allowAdmin === false && member.role === 'admin') {
        throw new ForbiddenException(
          'Admin role is not allowed for this action',
        );
      }

      // Attach member to request for use in controller
      request.organizationMember = member;
      return true;
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ForbiddenException) {
        throw error;
      }
      throw new ForbiddenException('Unable to verify membership');
    }
  }
}
