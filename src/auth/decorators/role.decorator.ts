import { SetMetadata } from '@nestjs/common';

export const Role = (...roles: ('VET' | 'CLIENT' | 'ADMIN' | 'ROOT')[]) =>
  SetMetadata('role', roles);
