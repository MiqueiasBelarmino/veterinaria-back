import { PartialType } from '@nestjs/mapped-types';
import { CreateEducationalMaterialDto } from './create-educational-material.dto';

export class UpdateEducationalMaterialDto extends PartialType(
  CreateEducationalMaterialDto,
) {}
