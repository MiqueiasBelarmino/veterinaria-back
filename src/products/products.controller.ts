import { Controller, Get, Post, Body, Param, UseGuards, Req } from '@nestjs/common';
import { ProductsService } from './products.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OrgContextGuard } from '../auth/guards/org.guard';
import { RolesGuard } from '../auth/guards/role.guard';
import { Role } from '../auth/decorators/role.decorator';

@Controller('products')
@UseGuards(JwtAuthGuard, OrgContextGuard, RolesGuard)
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @Role('VET') // Or ADMIN/STAFF
  create(@Req() req, @Body() body: any) {
    return this.productsService.create(body, req.user.activeOrganizationId);
  }

  @Get()
  @Role('VET')
  findAll(@Req() req) {
    return this.productsService.findAll(req.user.activeOrganizationId);
  }
}
