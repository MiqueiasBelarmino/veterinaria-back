import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
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
  constructor(
    private readonly educationalMaterialsService: EducationalMaterialsService,
  ) {}

  @Post()
  @RequireScopes('VET')
  create(@Body() createDto: CreateEducationalMaterialDto) {
    return this.educationalMaterialsService.create(createDto);
  }

  @Get()
  @RequireScopes('VET')
  findAll() {
    return this.educationalMaterialsService.findAll();
  }

  @Get(':id')
  @CheckOwnership({ paramName: 'id', resourceType: 'educationalMaterial' })
  findOne(@Param('id') id: string) {
    return this.educationalMaterialsService.findOne(id);
  }

  @Get('pet/:petId')
  @CheckOwnership({ paramName: 'petId', resourceType: 'pet' })
  findByPet(@Param('petId') petId: string) {
    return this.educationalMaterialsService.findByPet(petId);
  }

  @Patch(':id')
  @RequireScopes('VET')
  update(
    @Param('id') id: string,
    @Body() updateDto: UpdateEducationalMaterialDto,
  ) {
    return this.educationalMaterialsService.update(id, updateDto);
  }

  @Delete(':id')
  @RequireScopes('VET')
  remove(@Param('id') id: string) {
    return this.educationalMaterialsService.remove(id);
  }
}
