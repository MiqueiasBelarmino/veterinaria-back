import { SetMetadata } from '@nestjs/common';

export type AppRole = 'OWNER' | 'ADMIN' | 'VET' | 'STAFF' | 'CLIENT' | 'ROOT';

export const Roles = (...roles: AppRole[]) => SetMetadata('roles', roles);

export const Role = (...roles: AppRole[]) => Roles(...roles);
