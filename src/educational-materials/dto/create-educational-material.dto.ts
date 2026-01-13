import { IsString, IsOptional, IsEnum, IsArray, IsUUID } from 'class-validator';
import { MaterialType } from '@prisma/client';

export class CreateEducationalMaterialDto {
  @IsString()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(MaterialType)
  type: MaterialType;

  @IsString()
  @IsOptional()
  content?: string;

  @IsString()
  @IsOptional()
  attachmentUrl?: string;

  @IsString()
  @IsOptional()
  attachmentName?: string;

  @IsArray()
  @IsUUID('all', { each: true })
  @IsOptional()
  petIds?: string[];

  @IsArray()
  @IsUUID('all', { each: true })
  @IsOptional()
  appointmentIds?: string[];

  @IsArray()
  @IsUUID('all', { each: true })
  @IsOptional()
  planDefinitionIds?: string[];
}
