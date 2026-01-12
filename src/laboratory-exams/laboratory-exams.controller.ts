import { Controller, Get, Post, Body, Patch, Param, Delete, UsePipes, ValidationPipe } from '@nestjs/common';
import { LaboratoryExamsService } from './laboratory-exams.service';
import { CreateLaboratoryExamDto } from './dto/create-laboratory-exam.dto';
import { UpdateLaboratoryExamDto } from './dto/update-laboratory-exam.dto';

@Controller('laboratory-exams')
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
  findByPet(@Param('petId') petId: string) {
    return this.examsService.findByPet(petId);
  }

  @Get('plan/:planId')
  findByPlan(@Param('planId') planId: string) {
    return this.examsService.findByPlan(planId);
  }

  @Get(':id')
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
