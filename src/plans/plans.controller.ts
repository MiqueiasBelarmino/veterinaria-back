import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Patch,
  Param,
  UsePipes,
  ValidationPipe,
  Req,
} from '@nestjs/common';
import { PlansService } from './plans.service';
import { CreatePlanDto } from './dto/create-plan.dto';
import { UpdatePlanDto } from './dto/update-plan.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ScopesGuard } from '../auth/guards/scopes.guard';
import { RequireScopes } from '../auth/decorators/require-scopes.decorator';

@Controller('plans')
@UseGuards(JwtAuthGuard, ScopesGuard)
export class PlansController {
  constructor(private readonly plansService: PlansService) {}

  @Post()
  @UsePipes(new ValidationPipe({ transform: true }))
  @RequireScopes('VET')
  create(@Req() req, @Body() createPlanDto: CreatePlanDto) {
    return this.plansService.create(createPlanDto, req.user.organizationId);
  }

  @Get('pet/:petId')
  @RequireScopes('plans:own')
  findAllByPet(@Req() req, @Param('petId') petId: string) {
    return this.plansService.findAllByPet(petId, req.user.organizationId);
  }

  @Get('definitions')
  findAllDefinitions(@Req() req) {
    return this.plansService.findAllDefinitions(req.user.organizationId);
  }

  @Get(':id')
  @RequireScopes('plans:own')
  findOne(@Req() req, @Param('id') id: string) {
    return this.plansService.findOne(id, req.user.organizationId);
  }

  @Patch(':id')
  @UsePipes(new ValidationPipe({ transform: true }))
  @RequireScopes('plans:own')
  update(@Req() req, @Param('id') id: string, @Body() updatePlanDto: UpdatePlanDto) {
    return this.plansService.update(id, updatePlanDto, req.user.organizationId);
  }
}
