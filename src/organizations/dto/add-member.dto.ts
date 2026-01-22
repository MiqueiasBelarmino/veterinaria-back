import { IsString, IsEnum } from 'class-validator';

export enum OrganizationMemberRoleEnum {
  OWNER = 'OWNER',
  ADMIN = 'ADMIN',
  VET = 'VET',
  STAFF = 'STAFF',
  CLIENT = 'CLIENT',
}

export class AddMemberDto {
  @IsString()
  userId: string;

  @IsEnum(OrganizationMemberRoleEnum)
  role: OrganizationMemberRoleEnum;
}
