import { Controller, Get, Post, Body, Param, UseGuards, Req } from '@nestjs/common';
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
  create(@Req() req, @Body() body: any) {
    return this.salesService.create(body, req.user.organizationId);
  }

  @Get()
  @RequireScopes('VET')
  findAll(@Req() req) {
    return this.salesService.findAll(req.user.organizationId);
  }
}
