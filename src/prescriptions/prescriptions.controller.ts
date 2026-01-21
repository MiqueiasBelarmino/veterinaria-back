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
import { OrgGuard } from '../auth/guards/org.guard';
import { RoleGuard } from '../auth/guards/role.guard';
import { Role } from '../auth/decorators/role.decorator';
import { CreatePrescriptionDto } from './dto/create-prescription.dto';

@Controller('prescriptions')
@UseGuards(JwtAuthGuard, OrgGuard, RoleGuard) // Added OrgGuard
export class PrescriptionsController {
  constructor(private readonly prescriptionsService: PrescriptionsService) {}

  @Post()
  @UsePipes(new ValidationPipe({ transform: true }))
  @Role('VET') // Updated from RequireScopes for now to match new system
  create(
    @Request() req: any,
    @Body() createPrescriptionDto: CreatePrescriptionDto,
  ) {
    const user = req.user;
    return this.prescriptionsService.create(createPrescriptionDto, user.id, user.organizationId);
  }

  @Get()
  @Role('VET') // Or STAFF/ADMIN
  findAll(@Request() req: any) {
    return this.prescriptionsService.findAll(req.user.organizationId);
  }

  @Get(':id')
  // @Role('VET') // Legacy check needed?
  findOne(@Param('id') id: string) {
    return this.prescriptionsService.findOne(id);
  }
}
