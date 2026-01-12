import { PartialType } from '@nestjs/mapped-types';
import { CreateDietaryPlanDto } from './create-dietary-plan.dto';

export class UpdateDietaryPlanDto extends PartialType(CreateDietaryPlanDto) {}
