import { Controller, Post, Body, Get, UseGuards, Patch, Param, UsePipes, ValidationPipe } from '@nestjs/common';
import { AppointmentRequestsService } from './appointment-requests.service';
import { CreateAppointmentRequestDto } from './dto/create-appointment-request.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ScopesGuard } from '../auth/guards/scopes.guard';
import { Role } from '../auth/decorators/role.decorator';

@Controller('appointment-requests')
export class AppointmentRequestsController {
  constructor(private readonly appointmentRequestsService: AppointmentRequestsService) {}

  @Post()
  @UsePipes(new ValidationPipe({ transform: true }))
  create(@Body() createAppointmentRequestDto: CreateAppointmentRequestDto) {
    return this.appointmentRequestsService.create(createAppointmentRequestDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, ScopesGuard)
  @Role('ADMIN', 'ROOT', 'VET')
  findAll() {
    return this.appointmentRequestsService.findAll();
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard, ScopesGuard)
  @Role('ADMIN', 'ROOT', 'VET')
  updateStatus(
    @Param('id') id: string,
    @Body() body: { status: 'PENDING' | 'PROCESSED' | 'REJECTED' },
  ) {
    return this.appointmentRequestsService.updateStatus(id, body.status);
  }
}
