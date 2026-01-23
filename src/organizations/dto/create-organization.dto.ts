import { IsString, IsEnum, IsOptional, IsBoolean } from 'class-validator';

export enum OrganizationTypeEnum {
  CLINIC = 'clinic',
  PRACTICE = 'practice',
  GROUP = 'group',
}

export class CreateOrganizationDto {
  @IsString()
  name: string;

  @IsEnum(OrganizationTypeEnum)
  type: OrganizationTypeEnum;

  @IsOptional()
  @IsString()
  cnpj?: string;

  @IsOptional()
  @IsBoolean()
  isPhysicalLocation?: boolean;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsString()
  ownerId?: string;
}
