import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ClinicalRecordsService } from './clinical-records.service';
import { CreateClinicalRecordDto } from './dto/create-clinical-record.dto';

@Controller('clinical-records')
export class ClinicalRecordsController {
  constructor(
    private readonly clinicalRecordsService: ClinicalRecordsService,
  ) {}

  @Post()
  @UsePipes(new ValidationPipe({ transform: true }))
  create(@Body() createClinicalRecordDto: CreateClinicalRecordDto) {
    return this.clinicalRecordsService.create(createClinicalRecordDto);
  }

  @Get('pet/:petId')
  findAllByPet(@Param('petId') petId: string) {
    return this.clinicalRecordsService.findAllByPet(petId);
  }
}
