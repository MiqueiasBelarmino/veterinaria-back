import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { EducationalMaterialsService } from './educational-materials.service';
import { CreateEducationalMaterialDto } from './dto/create-educational-material.dto';
import { UpdateEducationalMaterialDto } from './dto/update-educational-material.dto';

@Controller('educational-materials')
export class EducationalMaterialsController {
  constructor(private readonly educationalMaterialsService: EducationalMaterialsService) {}

  @Post()
  create(@Body() createDto: CreateEducationalMaterialDto) {
    return this.educationalMaterialsService.create(createDto);
  }

  @Get()
  findAll() {
    return this.educationalMaterialsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.educationalMaterialsService.findOne(id);
  }

  @Get('pet/:petId')
  findByPet(@Param('petId') petId: string) {
    return this.educationalMaterialsService.findByPet(petId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDto: UpdateEducationalMaterialDto) {
    return this.educationalMaterialsService.update(id, updateDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.educationalMaterialsService.remove(id);
  }
}
