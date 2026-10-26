import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { ClinicsService } from './clinics.service';
import { CreateClinicDto } from './dto/create-clinic.dto';
import { UpdateClinicDto } from './dto/update-clinic.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RoleGuard } from '../auth/guards/role.guard';
import { Role } from '../auth/decorators/role.decorator';

@Controller('clinics')
@UseGuards(JwtAuthGuard, RoleGuard)
export class ClinicsController {
  constructor(private clinicsService: ClinicsService) {}

  @Role('VET', 'ADMIN', 'ROOT')
  @Post()
  create(@Body() body: CreateClinicDto) {
    return this.clinicsService.create(body);
  }

  @Get()
  findAll() {
    return this.clinicsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.clinicsService.findOne(id);
  }

  @Role('VET', 'ADMIN', 'ROOT')
  @Patch(':id')
  update(@Param('id') id: string, @Body() body: UpdateClinicDto) {
    return this.clinicsService.update(id, body);
  }

  @Role('VET', 'ADMIN', 'ROOT')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.clinicsService.remove(id);
  }
}
