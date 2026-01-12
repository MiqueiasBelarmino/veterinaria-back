import { IsEnum, IsString, IsNotEmpty, IsDate, IsOptional, IsArray } from 'class-validator';
import { Type } from 'class-transformer';
import { NutritionProtocol } from '@prisma/client';

export class CreateLaboratoryExamDto {
  @IsString()
  @IsNotEmpty()
  petId: string;

  @IsString()
  @IsOptional()
  planId?: string;

  @IsEnum(NutritionProtocol, { message: 'Protocolo nutricional inválido' })
  protocol: NutritionProtocol;

  @IsDate()
  @Type(() => Date)
  @IsNotEmpty()
  date: Date;

  @IsString()
  @IsNotEmpty()
  results: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  attachments?: string[];
}
