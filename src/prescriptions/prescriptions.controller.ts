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
import { ScopesGuard } from '../auth/guards/scopes.guard';
import { RequireScopes } from '../auth/decorators/require-scopes.decorator';
import { CreatePrescriptionDto } from './dto/create-prescription.dto';

@Controller('prescriptions')
@UseGuards(JwtAuthGuard, ScopesGuard)
export class PrescriptionsController {
  constructor(private readonly prescriptionsService: PrescriptionsService) {}

  @Post()
  @UsePipes(new ValidationPipe({ transform: true }))
  @RequireScopes('VET')
  create(
    @Request() req: any,
    @Body() createPrescriptionDto: CreatePrescriptionDto,
  ) {
    const user = req.user as { id: string };
    return this.prescriptionsService.create(createPrescriptionDto, user.id);
  }

  @Get()
  @RequireScopes('VET')
  findAll() {
    return this.prescriptionsService.findAll();
  }

  @Get(':id')
  @RequireScopes('prescriptions:own')
  findOne(@Param('id') id: string) {
    return this.prescriptionsService.findOne(id);
  }
}
