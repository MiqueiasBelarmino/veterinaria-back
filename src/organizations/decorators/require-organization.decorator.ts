import { SetMetadata } from '@nestjs/common';

export interface RequireOrganizationOptions {
  roles?: string[]; // Required roles: 'owner', 'admin', 'vet', 'staff'
  allowOwner?: boolean;
  allowAdmin?: boolean;
}

export const RequireOrganization = (
  options?: RequireOrganizationOptions,
) => SetMetadata('requireOrganization', options || {});
