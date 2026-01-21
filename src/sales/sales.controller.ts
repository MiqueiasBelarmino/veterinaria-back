import { Controller, Get, Post, Body, Param, UseGuards, Req } from '@nestjs/common';
import { SalesService } from './sales.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OrgGuard } from '../auth/guards/org.guard';
import { RoleGuard } from '../auth/guards/role.guard';
import { Role } from '../auth/decorators/role.decorator';

@Controller('sales')
@UseGuards(JwtAuthGuard, OrgGuard, RoleGuard)
export class SalesController {
  constructor(private readonly salesService: SalesService) {}

  @Post()
  @Role('VET') // Or STAFF/ADMIN
  create(@Req() req, @Body() body: any) {
    return this.salesService.create(body, req.user.organizationId);
  }

  @Get()
  @Role('VET')
  findAll(@Req() req) {
    return this.salesService.findAll(req.user.organizationId);
  }
}
