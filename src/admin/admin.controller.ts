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
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RoleGuard } from '../auth/guards/role.guard';
import { Role } from '../auth/decorators/role.decorator';
import { AdminService } from './admin.service';

@Controller('admin')
@UseGuards(JwtAuthGuard, RoleGuard)
@Role('ROOT')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

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
}
