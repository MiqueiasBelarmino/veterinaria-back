import { PartialType } from '@nestjs/mapped-types';
import { CreateLaboratoryExamDto } from './create-laboratory-exam.dto';

export class UpdateLaboratoryExamDto extends PartialType(
  CreateLaboratoryExamDto,
) {}
