import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAppointmentRequestDto } from './dto/create-appointment-request.dto';
import { RequestStatus } from '@prisma/client';

@Injectable()
export class AppointmentRequestsService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateAppointmentRequestDto) {
    return this.prisma.appointmentRequest.create({
      data: {
        ...data,
        status: RequestStatus.PENDING,
      },
    });
  }

  async findAll() {
    return this.prisma.appointmentRequest.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async updateStatus(id: string, status: RequestStatus) {
    return this.prisma.appointmentRequest.update({
      where: { id },
      data: { status },
    });
  }
}
