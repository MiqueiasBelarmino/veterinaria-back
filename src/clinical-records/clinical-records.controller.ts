import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ClinicalRecordsService } from './clinical-records.service';
import { CreateClinicalRecordDto } from './dto/create-clinical-record.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ScopesGuard } from '../auth/guards/scopes.guard';
import { OwnershipGuard } from '../auth/guards/ownership.guard';
import { RequireScopes } from '../auth/decorators/require-scopes.decorator';
import { CheckOwnership } from '../auth/decorators/check-ownership.decorator';

@Controller('clinical-records')
@UseGuards(JwtAuthGuard, ScopesGuard, OwnershipGuard)
export class ClinicalRecordsController {
  constructor(
    private readonly clinicalRecordsService: ClinicalRecordsService,
  ) {}

  @Post()
  @UsePipes(new ValidationPipe({ transform: true }))
  @RequireScopes('VET')
  create(@Body() createClinicalRecordDto: CreateClinicalRecordDto) {
    return this.clinicalRecordsService.create(createClinicalRecordDto);
  }

  @Get('pet/:petId')
  @CheckOwnership({ paramName: 'petId', resourceType: 'pet' })
  findAllByPet(@Param('petId') petId: string) {
    return this.clinicalRecordsService.findAllByPet(petId);
  }
}
