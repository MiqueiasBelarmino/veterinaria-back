import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  UseGuards,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RoleGuard } from '../auth/guards/role.guard';
import { Role } from '../auth/decorators/role.decorator';
import { AdminService } from './admin.service';
import { OrganizationService } from '../organizations/organizations.service';
import { CreateOrganizationDto } from '../organizations/dto/create-organization.dto';
import { UpdateOrganizationDto } from '../organizations/dto/update-organization.dto';

@Controller('admin')
@UseGuards(JwtAuthGuard, RoleGuard)
@Role('ROOT')
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly organizationService: OrganizationService,
  ) {}

  // Dashboard
  @Get('dashboard/stats')
  getDashboardStats() {
    return this.adminService.getDashboardStats();
  }

  @Get('dashboard/activity')
  getRecentActivity(@Query('limit') limit: string = '50') {
    return this.adminService.getRecentActivity(parseInt(limit, 10));
  }

  // Users Management
  @Get('users')
  getAllUsers() {
    return this.adminService.getAllUsers();
  }

  @Post('users')
  createUser(@Body() body: { name: string; email: string; password: string; role?: 'VET' | 'CLIENT' | 'ADMIN' | 'ROOT' }) {
    return this.adminService.createUser(body);
  }

  @Get('users/:id')
  getUserById(@Param('id') id: string) {
    return this.adminService.getUserById(id);
  }

  @Put('users/:id/role')
  updateUserRole(
    @Param('id') id: string,
    @Body() body: { role: 'VET' | 'CLIENT' | 'ADMIN' | 'ROOT' },
  ) {
    return this.adminService.updateUserRole(id, body.role);
  }

  @Put('users/:id/password')
  resetUserPassword(
    @Param('id') id: string,
    @Body() body: { password: string },
  ) {
    return this.adminService.resetUserPassword(id, body.password);
  }

  @Delete('users/:id')
  deleteUser(@Param('id') id: string) {
    return this.adminService.deleteUser(id);
  }

  // Clinics Management
  @Get('clinics')
  getAllClinics() {
    return this.adminService.getAllClinics();
  }

  @Get('clinics/:id/stats')
  getClinicStats(@Param('id') id: string) {
    return this.adminService.getClinicStats(id);
  }

  // Pets Management
  @Get('pets')
  getAllPets() {
    return this.adminService.getAllPets();
  }

  // Appointments Management
  @Get('appointments')
  getAllAppointments() {
    return this.adminService.getAllAppointments();
  }

  // System Settings
  @Get('system/settings')
  getSystemSettings() {
    return this.adminService.getSystemSettings();
  }

  // Organizations Management
  @Get('organizations')
  getAllOrganizations() {
    return this.organizationService.findAll();
  }

  @Get('organizations/:id')
  getOrganization(@Param('id') id: string) {
    return this.organizationService.findById(id);
  }

  @Post('organizations')
  @HttpCode(HttpStatus.CREATED)
  createOrganization(
    @Body() createOrgDto: CreateOrganizationDto,
  ) {
    // ROOT admin creates org without a specific owner for now
    // Can be updated later to assign ownership
    return this.organizationService.create(createOrgDto, undefined);
  }

  @Put('organizations/:id')
  updateOrganization(
    @Param('id') id: string,
    @Body() updateOrgDto: UpdateOrganizationDto,
  ) {
    return this.organizationService.update(id, updateOrgDto);
  }

  @Delete('organizations/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteOrganization(@Param('id') id: string) {
    return this.organizationService.delete(id);
  }

  @Get('organizations/:id/members')
  getOrganizationMembers(@Param('id') id: string) {
    return this.organizationService.getMembers(id);
  }

  @Get('organizations/:id/vets')
  getOrganizationVets(@Param('id') id: string) {
    return this.organizationService.getVets(id);
  }}