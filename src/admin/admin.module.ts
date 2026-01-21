import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { PrismaService } from '../prisma/prisma.service';
import { OrganizationService } from '../organizations/organizations.service';

@Module({
  controllers: [AdminController],
  providers: [AdminService, OrganizationService, PrismaService],
  exports: [AdminService, OrganizationService],
})
export class AdminModule {}
