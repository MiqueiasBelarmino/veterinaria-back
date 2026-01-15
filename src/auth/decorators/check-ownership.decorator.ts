import { SetMetadata } from '@nestjs/common';
import { OwnershipCheckOptions } from '../guards/ownership.guard';

export const CheckOwnership = (options: OwnershipCheckOptions) =>
  SetMetadata('ownershipCheck', options);
