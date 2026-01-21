import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

import { CreatePrescriptionDto } from './dto/create-prescription.dto';

@Injectable()
export class PrescriptionsService {
  constructor(private prisma: PrismaService) {}

  async create(createPrescriptionDto: CreatePrescriptionDto, userId: string, organizationId: string) {
    // 1. Get User and Vet Profile
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { vet: true },
    });

    if (!user) {
      throw new BadRequestException('Usuário não encontrado');
    }

    // Note: Role check is done by Guards. We assume if they are here, they are VET (or authorized).

    let vet = user.vet;

    // Auto-create Vet record if user doesn't have one (Global Profile)
    if (!vet) {
      vet = await this.prisma.vet.create({
        data: {
          userId: user.id,
          crmv: null,
          specialty: null,
        },
      });
    }

    const { petId, appointmentId, items, ...rest } = createPrescriptionDto;

    return this.prisma.prescription.create({
      data: {
        ...rest,
        organizationId,
        petId,
        vetId: vet.id,
        appointmentId: appointmentId && appointmentId !== 'none' ? appointmentId : undefined,
        items: {
          create: items.map((item) => ({
            medication: item.medication,
            dosage: item.dosage,
            frequency: item.frequency,
            duration: item.duration,
            notes: item.notes,
          })),
        },
      },
      include: {
        items: true,
        pet: true,
        vet: true,
        appointment: true,
      },
    });
  }

  findAll(organizationId: string) {
    return this.prisma.prescription.findMany({
      where: { organizationId },
      include: {
        pet: true,
        items: true,
        vet: { include: { user: true } },
      },
    });
  }

  findOne(id: string) {
    return this.prisma.prescription.findUnique({
      where: { id },
      include: {
        items: true,
        pet: true,
        vet: { include: { user: true } },
      },
    });
  }
}
