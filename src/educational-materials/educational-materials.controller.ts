import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { EducationalMaterialsService } from './educational-materials.service';
import { CreateEducationalMaterialDto } from './dto/create-educational-material.dto';
import { UpdateEducationalMaterialDto } from './dto/update-educational-material.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ScopesGuard } from '../auth/guards/scopes.guard';
import { OwnershipGuard } from '../auth/guards/ownership.guard';
import { RequireScopes } from '../auth/decorators/require-scopes.decorator';
import { CheckOwnership } from '../auth/decorators/check-ownership.decorator';

@Controller('educational-materials')
@UseGuards(JwtAuthGuard, ScopesGuard, OwnershipGuard)
export class EducationalMaterialsController {
  constructor(private readonly educationalMaterialsService: EducationalMaterialsService) {}

  @Post()
  @RequireScopes('VET')
  create(@Req() req, @Body() createDto: CreateEducationalMaterialDto) {
    return this.educationalMaterialsService.create(createDto, req.user.organizationId);
  }

  @Get()
  @RequireScopes('VET')
  findAll(@Req() req) {
    return this.educationalMaterialsService.findAll(req.user.organizationId);
  }

  @Get(':id')
  @CheckOwnership({ paramName: 'id', resourceType: 'educationalMaterial' })
  findOne(@Req() req, @Param('id') id: string) {
    return this.educationalMaterialsService.findOne(id, req.user.organizationId);
  }

  @Get('pet/:petId')
  @CheckOwnership({ paramName: 'petId', resourceType: 'pet' })
  findByPet(@Req() req, @Param('petId') petId: string) {
    return this.educationalMaterialsService.findByPet(petId, req.user.organizationId);
  }

  @Patch(':id')
  @RequireScopes('VET')
  update(@Req() req, @Param('id') id: string, @Body() updateDto: UpdateEducationalMaterialDto) {
    return this.educationalMaterialsService.update(id, updateDto, req.user.organizationId);
  }

  @Delete(':id')
  @RequireScopes('VET')
  remove(@Req() req, @Param('id') id: string) {
    return this.educationalMaterialsService.remove(id, req.user.organizationId);
  }
}
