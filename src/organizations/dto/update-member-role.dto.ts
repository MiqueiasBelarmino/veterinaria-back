import { IsString, IsEnum } from 'class-validator';
import { OrganizationMemberRoleEnum } from './add-member.dto';

export class UpdateMemberRoleDto {
  @IsEnum(OrganizationMemberRoleEnum)
  role: OrganizationMemberRoleEnum;
}
