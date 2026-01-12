import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { PlansService } from './plans.service';
import { CreatePlanDto } from './dto/create-plan.dto';
import { UpdatePlanDto } from './dto/update-plan.dto';

@Controller('plans')
export class PlansController {
  constructor(private readonly plansService: PlansService) {}

  @Post()
  @UsePipes(new ValidationPipe({ transform: true }))
  create(@Body() createPlanDto: CreatePlanDto) {
    return this.plansService.create(createPlanDto);
  }

  @Get('pet/:petId')
  findAllByPet(@Param('petId') petId: string) {
    return this.plansService.findAllByPet(petId);
  }

  @Get('definitions')
  findAllDefinitions() {
    return this.plansService.findAllDefinitions();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.plansService.findOne(id);
  }

  @Patch(':id')
  @UsePipes(new ValidationPipe({ transform: true }))
  update(@Param('id') id: string, @Body() updatePlanDto: UpdatePlanDto) {
    return this.plansService.update(id, updatePlanDto);
  }
}
