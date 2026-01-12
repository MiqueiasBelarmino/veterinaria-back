import {
  IsString,
  IsNotEmpty,
  IsDate,
  IsEnum,
  IsBoolean,
  IsOptional,
  IsNumber,
} from 'class-validator';
import { Type } from 'class-transformer';

export enum PlanStatus {
  ACTIVE = 'ACTIVE',
  PAUSED = 'PAUSED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export class CreatePlanDto {
  @IsString()
  @IsNotEmpty()
  petId: string;

  @IsString()
  @IsNotEmpty()
  planDefinitionId: string;

  @IsDate()
  @Type(() => Date)
  startDate: Date;

  @IsDate()
  @Type(() => Date)
  endDate: Date;

  @IsEnum(PlanStatus)
  @IsOptional()
  status?: PlanStatus;

  @IsNumber()
  @IsOptional()
  returnsUsed?: number;

  @IsBoolean()
  @IsOptional()
  overrideExamReturnCounts?: boolean;
}
