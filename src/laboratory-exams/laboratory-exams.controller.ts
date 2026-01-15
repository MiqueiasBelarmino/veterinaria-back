import { Controller, Get, Post, Body, Patch, Param, Delete, UsePipes, ValidationPipe, UseGuards } from '@nestjs/common';
import { LaboratoryExamsService } from './laboratory-exams.service';
import { CreateLaboratoryExamDto } from './dto/create-laboratory-exam.dto';
import { UpdateLaboratoryExamDto } from './dto/update-laboratory-exam.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OwnershipGuard } from '../auth/guards/ownership.guard';
import { CheckOwnership } from '../auth/decorators/check-ownership.decorator';

@Controller('laboratory-exams')
@UseGuards(JwtAuthGuard, OwnershipGuard)
export class LaboratoryExamsController {
  constructor(private readonly examsService: LaboratoryExamsService) {}

  @Post()
  @UsePipes(new ValidationPipe({ transform: true }))
  create(@Body() createDto: CreateLaboratoryExamDto) {
    return this.examsService.create(createDto);
  }

  @Get()
  findAll() {
    return this.examsService.findAll();
  }

  @Get('pet/:petId')
  @CheckOwnership({ paramName: 'petId', resourceType: 'pet' })
  findByPet(@Param('petId') petId: string) {
    return this.examsService.findByPet(petId);
  }

  @Get('plan/:planId')
  findByPlan(@Param('planId') planId: string) {
    return this.examsService.findByPlan(planId);
  }

  @Get(':id')
  @CheckOwnership({ paramName: 'id', resourceType: 'exam' })
  findOne(@Param('id') id: string) {
    return this.examsService.findOne(id);
  }

  @Patch(':id')
  @UsePipes(new ValidationPipe({ transform: true }))
  update(@Param('id') id: string, @Body() updateDto: UpdateLaboratoryExamDto) {
    return this.examsService.update(id, updateDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.examsService.remove(id);
  }
}
