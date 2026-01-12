import { Controller, Get, Post, Body, Param, UsePipes, ValidationPipe } from '@nestjs/common';
import { DietaryPlansService } from './dietary-plans.service';
import { CreateDietaryPlanDto } from './dto/create-dietary-plan.dto';

@Controller('dietary-plans')
export class DietaryPlansController {
  constructor(private readonly dietaryPlansService: DietaryPlansService) {}

  @Post()
  @UsePipes(new ValidationPipe({ transform: true }))
  create(@Body() createDto: CreateDietaryPlanDto) {
    return this.dietaryPlansService.create(createDto);
  }

  @Get('pet/:petId')
  findAllByPet(@Param('petId') petId: string) {
    return this.dietaryPlansService.findAllByPet(petId);
  }

  @Get('pet/:petId/active')
  findActiveByPet(@Param('petId') petId: string) {
    return this.dietaryPlansService.findActiveByPet(petId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.dietaryPlansService.findOne(id);
  }
}
