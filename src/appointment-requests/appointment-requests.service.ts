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

  async linkClientToRequests(cpf: string, clientId: string) {
    await this.prisma.appointmentRequest.updateMany({
      where: { ownerCpf: cpf, clientId: null },
      data: { clientId },
    });
  }

  async updateStatus(id: string, status: RequestStatus) {
    return this.prisma.appointmentRequest.update({
      where: { id },
      data: { status },
    });
  }

  async process(id: string) {
    const request = await this.prisma.appointmentRequest.findUnique({
      where: { id },
    });

    if (!request) throw new Error('Solicitação não encontrada');

    let clientId = request.clientId;

    // 1. Create or link client
    if (!clientId) {
      if (request.ownerCpf) {
        const existingClient = await this.prisma.client.findUnique({
          where: { cpf: request.ownerCpf },
        });

        if (existingClient) {
          clientId = existingClient.id;
        }
      }

      if (!clientId) {
        const newClient = await this.prisma.client.create({
          data: {
            name: request.ownerName,
            email: request.ownerEmail,
            phone: request.ownerPhone,
            cpf: request.ownerCpf,
          },
        });
        clientId = newClient.id;
      }

      // Link client to request
      await this.prisma.appointmentRequest.update({
        where: { id },
        data: { clientId },
      });
    }

    // 2. Create or find pet for this client
    let pet = await this.prisma.pet.findFirst({
      where: {
        clientId,
        name: request.petName,
        species: request.petSpecies,
      },
    });

    if (!pet) {
      pet = await this.prisma.pet.create({
        data: {
          name: request.petName,
          species: request.petSpecies,
          clientId,
        },
      });
    }

    return { clientId, petId: pet.id };
  }
}
