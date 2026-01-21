import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { OrganizationService } from '../../organizations/organizations.service';

@Injectable()
export class OrganizationOwnerGuard implements CanActivate {
  constructor(private organizationService: OrganizationService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const organizationId = request.params.id || request.params.organizationId;
    const userId = request.user?.id;

    if (!organizationId) {
      throw new ForbiddenException('Organization ID is required');
    }

    if (!userId) {
      throw new ForbiddenException('User is not authenticated');
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
