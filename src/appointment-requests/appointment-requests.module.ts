import { Module } from '@nestjs/common';
import { AppointmentRequestsService } from './appointment-requests.service';
import { AppointmentRequestsController } from './appointment-requests.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [AppointmentRequestsController],
  providers: [AppointmentRequestsService, PrismaService],
})
export class AppointmentRequestsModule {}
