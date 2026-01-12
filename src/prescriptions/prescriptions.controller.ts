import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { PrescriptionsService } from './prescriptions.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreatePrescriptionDto } from './dto/create-prescription.dto';

@Controller('prescriptions')
@UseGuards(JwtAuthGuard)
export class PrescriptionsController {
  constructor(private readonly prescriptionsService: PrescriptionsService) {}

  @Post()
  @UsePipes(new ValidationPipe({ transform: true }))
  create(
    @Request() req: any,
    @Body() createPrescriptionDto: CreatePrescriptionDto,
  ) {
    const user = req.user as { id: string };
    return this.prescriptionsService.create(createPrescriptionDto, user.id);
  }

  @Get()
  findAll() {
    return this.prescriptionsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.prescriptionsService.findOne(id);
  }
}
