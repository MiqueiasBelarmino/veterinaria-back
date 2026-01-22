import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  UsePipes,
  ValidationPipe,
  Request,
} from '@nestjs/common';
import { AppointmentsService } from './appointments.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OrgContextGuard } from '../auth/guards/org.guard';
import { RolesGuard } from '../auth/guards/role.guard';
import { Role } from '../auth/decorators/role.decorator';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';

@Controller('appointments')
@UseGuards(JwtAuthGuard, OrgContextGuard, RolesGuard)
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  @Post()
  @UsePipes(new ValidationPipe({ transform: true }))
  @Role('VET', 'STAFF', 'ADMIN', 'OWNER')
  create(@Request() req, @Body() createAppointmentDto: CreateAppointmentDto) {
    return this.appointmentsService.create(createAppointmentDto, req.user.activeOrganizationId);
  }

  @Get()
  @Role('VET', 'STAFF', 'ADMIN', 'OWNER')
  findAll(@Request() req) {
    return this.appointmentsService.findAll(req.user.activeOrganizationId);
  }

  @Get(':id')
  @Role('VET', 'STAFF', 'ADMIN', 'OWNER')
  findOne(@Param('id') id: string) {
    return this.appointmentsService.findOne(id);
  }

  @Patch(':id')
  @UsePipes(new ValidationPipe({ transform: true }))
  @Role('VET', 'STAFF', 'ADMIN', 'OWNER')
  update(
    @Param('id') id: string,
    @Body() updateAppointmentDto: UpdateAppointmentDto,
  ) {
    return this.appointmentsService.update(id, updateAppointmentDto);
  }

  @Delete(':id')
  @Role('ADMIN', 'OWNER') // Only Admin/Owner can delete? Or maybe VET/STAFF too if mistake? Let's restrict Delete.
  remove(@Param('id') id: string) {
    return this.appointmentsService.remove(id);
  }
}
