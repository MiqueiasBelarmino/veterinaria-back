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
  create(@Body() createPlanDto: CreatePlanDto) {
    return this.plansService.create(createPlanDto);
  }

  @Get('pet/:petId')
  @RequireScopes('plans:own')
  findAllByPet(@Param('petId') petId: string) {
    return this.plansService.findAllByPet(petId);
  }

  @Get('definitions')
  findAllDefinitions() {
    return this.plansService.findAllDefinitions();
  }

  @Get(':id')
  @RequireScopes('plans:own')
  findOne(@Param('id') id: string) {
    return this.plansService.findOne(id);
  }

  @Patch(':id')
  @UsePipes(new ValidationPipe({ transform: true }))
  @RequireScopes('plans:own')
  update(@Param('id') id: string, @Body() updatePlanDto: UpdatePlanDto) {
    return this.plansService.update(id, updatePlanDto);
  }
}
