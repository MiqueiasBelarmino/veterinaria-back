import { Controller, Get, Post, Body, Param, UsePipes, ValidationPipe, UseGuards, Req } from '@nestjs/common';
import { DietaryPlansService } from './dietary-plans.service';
import { CreateDietaryPlanDto } from './dto/create-dietary-plan.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OrgGuard } from '../auth/guards/org.guard';
import { RoleGuard } from '../auth/guards/role.guard';
import { Role } from '../auth/decorators/role.decorator';
import { OwnershipGuard } from '../auth/guards/ownership.guard';
import { CheckOwnership } from '../auth/decorators/check-ownership.decorator';

@Controller('dietary-plans')
@UseGuards(JwtAuthGuard, OrgGuard) // OwnershipGuard potentially conditional
export class DietaryPlansController {
  constructor(private readonly dietaryPlansService: DietaryPlansService) {}

  @Post()
  @UsePipes(new ValidationPipe({ transform: true }))
  @Role('VET')
  create(@Req() req, @Body() createDto: CreateDietaryPlanDto) {
    return this.dietaryPlansService.create(createDto, req.user.organizationId);
  }

  @Get('pet/:petId')
  @CheckOwnership({ paramName: 'petId', resourceType: 'pet' })
  findAllByPet(@Param('petId') petId: string) {
    return this.dietaryPlansService.findAllByPet(petId);
  }

  @Get('pet/:petId/active')
  @CheckOwnership({ paramName: 'petId', resourceType: 'pet' })
  findActiveByPet(@Param('petId') petId: string) {
    return this.dietaryPlansService.findActiveByPet(petId);
  }

  @Get(':id')
  @CheckOwnership({ paramName: 'id', resourceType: 'dietaryPlan' })
  findOne(@Param('id') id: string) {
    return this.dietaryPlansService.findOne(id);
  }
}
