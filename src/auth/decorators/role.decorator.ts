import { SetMetadata } from '@nestjs/common';

export const Role = (role: 'OWNER' | 'ADMIN' | 'VET' | 'STAFF' | 'ROOT' | 'CLIENT') =>
  SetMetadata('role', role);
