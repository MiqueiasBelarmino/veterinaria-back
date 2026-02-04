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
} from '@nestjs/common';
import { AppointmentsService } from './appointments.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ScopesGuard } from '../auth/guards/scopes.guard';
import { RequireScopes } from '../auth/decorators/require-scopes.decorator';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';

@Controller('appointments')
@UseGuards(JwtAuthGuard, ScopesGuard)
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  @Post()
  @UsePipes(new ValidationPipe({ transform: true }))
  create(@Body() createAppointmentDto: CreateAppointmentDto) {
    return this.appointmentsService.create(createAppointmentDto);
  }

  @Get()
  findAll() {
    return this.appointmentsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.appointmentsService.findOne(id);
  }

  @Patch(':id')
  @UsePipes(new ValidationPipe({ transform: true }))
  update(
    @Param('id') id: string,
    @Body() updateAppointmentDto: UpdateAppointmentDto,
  ) {
    return this.appointmentsService.update(id, updateAppointmentDto);
  }

  @Delete(':id')
  @RequireScopes('appointments:own')
  remove(@Param('id') id: string) {
    return this.appointmentsService.remove(id);
  }

  @Patch(':id/finish')
  @UsePipes(new ValidationPipe({ transform: true }))
  finish(@Param('id') id: string) {
    return this.appointmentsService.finish(id);
  }

  @Patch(':id/cancel')
  @UsePipes(new ValidationPipe({ transform: true }))
  cancel(@Param('id') id: string) {
    return this.appointmentsService.cancel(id);
  }

  @Patch(':id/checkin')
  @UsePipes(new ValidationPipe({ transform: true }))
  checkin(@Param('id') id: string) {
    return this.appointmentsService.checkin(id);
  }
}
