import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { EducationalMaterialsService } from './educational-materials.service';
import { CreateEducationalMaterialDto } from './dto/create-educational-material.dto';
import { UpdateEducationalMaterialDto } from './dto/update-educational-material.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OrgContextGuard } from '../auth/guards/org.guard';
import { RolesGuard } from '../auth/guards/role.guard';
import { Role } from '../auth/decorators/role.decorator';
import { CheckOwnership } from '../auth/decorators/check-ownership.decorator';
import { OwnershipGuard } from '../auth/guards/ownership.guard';

@Controller('educational-materials')
@UseGuards(JwtAuthGuard, OrgContextGuard) // OwnershipGuard potentially specific to endpoints
export class EducationalMaterialsController {
  constructor(private readonly educationalMaterialsService: EducationalMaterialsService) {}

  @Post()
  @Role('VET')
  create(@Req() req, @Body() createDto: CreateEducationalMaterialDto) {
    return this.educationalMaterialsService.create(createDto, req.user.activeOrganizationId);
  }

  @Get()
  @Role('VET')
  findAll(@Req() req) {
    return this.educationalMaterialsService.findAll(req.user.activeOrganizationId);
  }

  @Get(':id')
  @CheckOwnership({ paramName: 'id', resourceType: 'educationalMaterial' })
  findOne(@Req() req, @Param('id') id: string) {
    return this.educationalMaterialsService.findOne(id, req.user.activeOrganizationId);
  }

  @Get('pet/:petId')
  @CheckOwnership({ paramName: 'petId', resourceType: 'pet' })
  findByPet(@Req() req, @Param('petId') petId: string) {
    return this.educationalMaterialsService.findByPet(petId, req.user.activeOrganizationId);
  }

  @Patch(':id')
  @Role('VET')
  update(@Req() req, @Param('id') id: string, @Body() updateDto: UpdateEducationalMaterialDto) {
    return this.educationalMaterialsService.update(id, updateDto, req.user.activeOrganizationId);
  }

  @Delete(':id')
  @Role('VET')
  remove(@Req() req, @Param('id') id: string) {
    return this.educationalMaterialsService.remove(id, req.user.activeOrganizationId);
  }
}
