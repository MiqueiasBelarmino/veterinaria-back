import { IsString, IsEnum, IsOptional } from 'class-validator';

export enum OrganizationMemberRoleEnum {
  OWNER = 'OWNER',
  ADMIN = 'ADMIN',
  VET = 'VET',
  STAFF = 'STAFF',
  CLIENT = 'CLIENT',
}

export class AddMemberDto {
  @IsString()
  @IsOptional()
  userId?: string;

  @IsString()
  @IsOptional()
  email?: string; // If userId not present, try find by email

  @IsString()
  @IsOptional()
  name?: string; // If creating new user

  @IsString()
  @IsOptional()
  password?: string; // If creating new user

  @IsEnum(OrganizationMemberRoleEnum)
  role: OrganizationMemberRoleEnum;
}
