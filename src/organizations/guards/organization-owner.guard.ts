import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { OrganizationService } from '../../organizations/organizations.service';

import { isRootAssumedForOrg, getOrganizationIdFromRequest } from '../../auth/utils/auth-helpers';

@Injectable()
export class OrganizationOwnerGuard implements CanActivate {
  constructor(private organizationService: OrganizationService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const organizationId = getOrganizationIdFromRequest(request);
    const userId = request.user?.id;

    if (!organizationId) {
      throw new ForbiddenException('Organization ID is required');
    }

    if (!userId) {
      throw new ForbiddenException('User is not authenticated');
    }

    // Bypass for Assumed Root
    if (isRootAssumedForOrg(request.user, organizationId)) {
        // We might need to fetch the org to attach it to the request as controllers expect it
        try {
            const organization = await this.organizationService.findById(organizationId);
            request.organization = organization;
            return true;
        } catch(e) {
             throw new NotFoundException(`Organization with id ${organizationId} not found`);
        }
    }

    try {
      const organization = await this.organizationService.findById(organizationId);
      
      if (organization.ownerId !== userId) {
        throw new ForbiddenException(
          'Only the organization owner can perform this action',
        );
      }

      // Attach organization to request for use in controller
      request.organization = organization;
      return true;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new ForbiddenException('Unable to verify ownership');
    }
  }
}
