import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAppointmentRequestDto } from './dto/create-appointment-request.dto';
import { RequestStatus } from '@prisma/client';

@Injectable()
export class AppointmentRequestsService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateAppointmentRequestDto) {
    const { ownerCpf, ...rest } = data;

    const existingClient = ownerCpf
      ? await this.prisma.client.findUnique({ where: { cpf: ownerCpf } })
      : null;

    return this.prisma.appointmentRequest.create({
      data: {
        ...rest,
        ownerCpf,
        status: RequestStatus.PENDING,
        clientId: existingClient?.id,
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
