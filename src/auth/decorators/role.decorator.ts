import { SetMetadata } from '@nestjs/common';

export const Role = (role: 'VET' | 'CLIENT' | 'ADMIN' | 'ROOT') =>
  SetMetadata('role', role);
