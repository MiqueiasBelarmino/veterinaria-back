import { IsString, IsEnum, IsOptional, IsBoolean } from 'class-validator';
import { OrganizationTypeEnum } from './create-organization.dto';

export class UpdateOrganizationDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEnum(OrganizationTypeEnum)
  type?: OrganizationTypeEnum;

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
