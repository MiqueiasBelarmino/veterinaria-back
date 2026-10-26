import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UsePipes,
  ValidationPipe,
  UseGuards,
} from '@nestjs/common';
import { LaboratoryExamsService } from './laboratory-exams.service';
import { CreateLaboratoryExamDto } from './dto/create-laboratory-exam.dto';
import { UpdateLaboratoryExamDto } from './dto/update-laboratory-exam.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RoleGuard } from '../auth/guards/role.guard';
import { Role } from '../auth/decorators/role.decorator';
import { OwnershipGuard } from '../auth/guards/ownership.guard';
import { CheckOwnership } from '../auth/decorators/check-ownership.decorator';

@Controller('laboratory-exams')
@UseGuards(JwtAuthGuard, RoleGuard, OwnershipGuard)
export class LaboratoryExamsController {
  constructor(private readonly examsService: LaboratoryExamsService) {}

  @Post()
  @Role('VET', 'ADMIN', 'ROOT')
  @UsePipes(new ValidationPipe({ transform: true }))
  create(@Body() createDto: CreateLaboratoryExamDto) {
    return this.examsService.create(createDto);
  }

  @Get()
  @Role('VET', 'ADMIN', 'ROOT')
  findAll() {
    return this.examsService.findAll();
  }

  @Get('pet/:petId')
  @CheckOwnership({ paramName: 'petId', resourceType: 'pet' })
  findByPet(@Param('petId') petId: string) {
    return this.examsService.findByPet(petId);
  }


  @Get(':id')
  @CheckOwnership({ paramName: 'id', resourceType: 'exam' })
  findOne(@Param('id') id: string) {
    return this.examsService.findOne(id);
  }

  @Patch(':id')
  @Role('VET', 'ADMIN', 'ROOT')
  @UsePipes(new ValidationPipe({ transform: true }))
  update(@Param('id') id: string, @Body() updateDto: UpdateLaboratoryExamDto) {
    return this.examsService.update(id, updateDto);
  }

  @Delete(':id')
  @Role('VET', 'ADMIN', 'ROOT')
  remove(@Param('id') id: string) {
    return this.examsService.remove(id);
  }
}
