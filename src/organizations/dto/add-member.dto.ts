import { IsString, IsEnum } from 'class-validator';

export enum OrganizationMemberRoleEnum {
  OWNER = 'owner',
  ADMIN = 'admin',
  VET = 'vet',
  STAFF = 'staff',
}

export class AddMemberDto {
  @IsString()
  userId: string;

  @IsEnum(OrganizationMemberRoleEnum)
  role: OrganizationMemberRoleEnum;
}
