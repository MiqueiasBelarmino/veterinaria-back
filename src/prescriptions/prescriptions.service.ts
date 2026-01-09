import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class PrescriptionsService {
  constructor(private prisma: PrismaService) {}

  async create(data: any, userId: string) {
    // First, get the user to check their role
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { vet: true },
    });

    if (!user) {
      throw new BadRequestException('Usuário não encontrado');
    }

    if (user.role !== 'VET') {
      throw new BadRequestException(
        'Apenas veterinários podem criar prescrições. Seu perfil atual é: ' + user.role
      );
    }

    let vet = user.vet;

    // Auto-create Vet record if user is VET but doesn't have one
    if (!vet) {
      vet = await this.prisma.vet.create({
        data: {
          userId: user.id,
          crmv: null,
          specialty: null,
        },
      });
    }

    const { petId, appointmentId, items, ...rest } = data;

    return this.prisma.prescription.create({
      data: {
        ...rest,
        pet: { connect: { id: petId } },
        vet: { connect: { id: vet.id } },
        appointment: appointmentId && appointmentId !== 'none' 
          ? { connect: { id: appointmentId } } 
          : undefined,
        items: {
          create: items.map((item: any) => ({
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

  findAll() {
    return this.prisma.prescription.findMany({ 
      include: { 
        pet: true, 
        items: true, 
        vet: { include: { user: true } } 
      } 
    });
  }

  findOne(id: string) {
    return this.prisma.prescription.findUnique({ 
      where: { id }, 
      include: { 
        items: true, 
        pet: true, 
        vet: { include: { user: true } } 
      } 
    });
  }
}
