import { Controller, Get, Post, Body, Param, UseGuards, Req } from '@nestjs/common';
import { ProductsService } from './products.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ScopesGuard } from '../auth/guards/scopes.guard';
import { RequireScopes } from '../auth/decorators/require-scopes.decorator';

@Controller('products')
@UseGuards(JwtAuthGuard, ScopesGuard)
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @RequireScopes('VET')
  create(@Req() req, @Body() body: any) {
    return this.productsService.create(body, req.user.organizationId);
  }

  @Get()
  @RequireScopes('VET')
  findAll(@Req() req) {
    return this.productsService.findAll(req.user.organizationId);
  }
}
