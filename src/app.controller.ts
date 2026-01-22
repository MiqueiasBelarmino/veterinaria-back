import { Controller, Get, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { RolesGuard } from './auth/guards/role.guard';
import { Role } from './auth/decorators/role.decorator';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('admin/dashboard/stats')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Role('ROOT')
  async getAdminStats() {
      // Mock stats for now to unblock frontend
      return {
          totalOrganizations: 3, // Mock
          totalUsers: 5, // Mock
          activeUsers: 2, // Mock
          revenue: 15000 // Mock
      };
  }
}
