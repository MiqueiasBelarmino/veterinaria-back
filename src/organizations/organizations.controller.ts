import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RoleGuard } from '../auth/guards/role.guard';
import { Role } from '../auth/decorators/role.decorator';
import { OrganizationService } from './organizations.service';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { AddMemberDto } from './dto/add-member.dto';
import { UpdateMemberRoleDto } from './dto/update-member-role.dto';

@Controller('organizations')
@UseGuards(JwtAuthGuard)
export class OrganizationController {
  constructor(private organizationService: OrganizationService) {}

  // ============= ORGANIZATION ENDPOINTS =============

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createOrgDto: CreateOrganizationDto, @Req() req: any) {
    const ownerId = req.user.role === 'ROOT' && createOrgDto.ownerId 
      ? createOrgDto.ownerId 
      : (req.user.role === 'ROOT' ? undefined : req.user.id);
      
    return await this.organizationService.create(
      createOrgDto,
      ownerId,
    );
  }

  @Get()
  async findAll() {
    return await this.organizationService.findAll();
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    return await this.organizationService.findById(id);
  }

  @Put(':id')
  @UseGuards(RoleGuard)
  @Role('ROOT')
  async update(
    @Param('id') id: string,
    @Body() updateOrgDto: UpdateOrganizationDto,
  ) {
    return await this.organizationService.update(id, updateOrgDto);
  }

  @Delete(':id')
  @UseGuards(RoleGuard)
  @Role('ROOT')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id') id: string) {
    return await this.organizationService.delete(id);
  }

  // ============= MEMBER ENDPOINTS =============

  @Get(':id/members')
  async getMembers(@Param('id') id: string) {
    return await this.organizationService.getMembers(id);
  }

  @Post(':id/members')
  @HttpCode(HttpStatus.CREATED)
  async addMember(
    @Param('id') id: string,
    @Body() addMemberDto: AddMemberDto,
    @Req() req: any,
  ) {
    // Verify user is owner or admin of organization
    // Verify user is owner or admin of organization
    const member = await this.organizationService.checkMembership(id, req.user.id, req.user.role);
    
    if (member.role !== 'owner' && member.role !== 'admin') {
      throw new Error('Only owners and admins can add members');
    }

    return await this.organizationService.addMember(id, addMemberDto);
  }

  @Delete(':id/members/:userId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeMember(
    @Param('id') id: string,
    @Param('userId') userId: string,
    @Req() req: any,
  ) {
    // Verify user is owner or admin of organization
    // Verify user is owner or admin of organization
    const member = await this.organizationService.checkMembership(id, req.user.id, req.user.role);
    
    if (member.role !== 'owner' && member.role !== 'admin') {
      throw new Error('Only owners and admins can remove members');
    }

    return await this.organizationService.removeMember(id, userId);
  }

  @Put(':id/members/:userId/role')
  async updateMemberRole(
    @Param('id') id: string,
    @Param('userId') userId: string,
    @Body() updateRoleDto: UpdateMemberRoleDto,
    @Req() req: any,
  ) {
    // Verify user is owner or admin of organization
    // Verify user is owner or admin of organization
    const member = await this.organizationService.checkMembership(id, req.user.id, req.user.role);
    
    if (member.role !== 'owner' && member.role !== 'admin') {
      throw new Error('Only owners and admins can change member roles');
    }

    return await this.organizationService.updateMemberRole(
      id,
      userId,
      updateRoleDto,
    );
  }

  // ============= VET ENDPOINTS =============

  @Get(':id/vets')
  async getVets(@Param('id') id: string) {
    return await this.organizationService.getVets(id);
  }

  // ============= USER ORGANIZATIONS =============

  @Get('user/my-organizations')
  async getUserOrganizations(@Req() req: any) {
    return await this.organizationService.getUserOrganizations(req.user.id);
  }
}
