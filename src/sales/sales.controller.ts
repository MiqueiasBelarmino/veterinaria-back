import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { SalesService } from './sales.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ScopesGuard } from '../auth/guards/scopes.guard';
import { RequireScopes } from '../auth/decorators/require-scopes.decorator';

@Controller('sales')
@UseGuards(JwtAuthGuard, ScopesGuard)
export class SalesController {
  constructor(private readonly salesService: SalesService) {}

  @Post()
  @RequireScopes('VET')
  create(@Body() body: any) {
    return this.salesService.create(body);
  }

  @Get()
  @RequireScopes('VET')
  findAll() {
    return this.salesService.findAll();
  }
}
