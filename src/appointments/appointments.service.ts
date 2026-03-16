import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AppointmentStatus, Prisma } from '@prisma/client';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';

@Injectable()
export class AppointmentsService {
  constructor(private prisma: PrismaService) {}

  async create(createAppointmentDto: CreateAppointmentDto) {
    const { petId, planId, vetId, ...data } = createAppointmentDto;

    // Logic for Plan Return management
    if (planId) {
      const plan = await this.prisma.plan.findUnique({
        where: { id: planId },
        include: { definition: true },
      });

      if (!plan) throw new Error('Plan not found');
      if (plan.status !== 'ACTIVE') throw new Error('Plan is not active');
      if (plan.petId !== petId)
        throw new Error('Plan does not belong to this pet');

      if (createAppointmentDto.type === 'RETURN') {
        if (plan.returnsUsed >= plan.definition.returnsIncluded) {
          // Allow override check if needed, strictly enforcing for now based on requirements
          throw new Error('Limit of returns for this plan reached');
        }

        // Increment returns used
        await this.prisma.plan.update({
          where: { id: planId },
          data: { returnsUsed: { increment: 1 } },
        });
      }
    }

    const appointmentData: Prisma.AppointmentCreateInput = {
      ...data,
      pet: { connect: { id: petId } },
      vet: vetId ? { connect: { id: vetId } } : undefined,
    };

    if (planId) {
      appointmentData.plan = { connect: { id: planId } };
    }
    // Create appointment and include pet -> client to allow notification creation
    const created = await this.prisma.appointment.create({
      data: appointmentData,
      include: {
        pet: {
          include: {
            client: true,
          },
        },
      },
    });

    // Create a simple notification for the pet owner (if linked to a user)
    try {
      const clientUserId = created.pet?.client?.userId;
      if (clientUserId) {
        await this.prisma.notification.create({
          data: {
            user: { connect: { id: clientUserId } },
            appointment: { connect: { id: created.id } },
            type: 'APPOINTMENT_CREATED',
            data: {
              message: `Consulta agendada para ${created.date.toISOString()}`,
            },
          },
        });
      }
    } catch (err) {
      // Don't fail appointment creation for notification errors, log if necessary

      console.error('Failed to create notification:', err);
    }

    return created;
  }

  findAll(vetId?: string) {
    const where: Prisma.AppointmentWhereInput = {};
    if (vetId) where.vetId = vetId;
    return this.prisma.appointment.findMany({
      where,
      include: { pet: true, vet: true },
    });
  }

  findOne(id: string) {
    return this.prisma.appointment.findUnique({
      where: { id },
      include: { pet: true, prescription: true, vet: true },
    });
  }

  update(id: string, updateAppointmentDto: UpdateAppointmentDto) {
    const { petId, vetId, ...data } = updateAppointmentDto as any;
    const updateData: Prisma.AppointmentUpdateInput = { ...data };

    if (petId) {
      updateData.pet = { connect: { id: petId } };
    }
    if (vetId) {
      updateData.vet = { connect: { id: vetId } };
    }

    return this.prisma.appointment.update({ where: { id }, data: updateData });
  }

  remove(id: string) {
    return this.prisma.appointment.delete({ where: { id } });
  }

  finish(id: string) {
    return this.prisma.appointment.update({
      where: { id },
      data: { status: AppointmentStatus.COMPLETED },
    });
  }

  cancel(id: string) {
    return this.prisma.appointment.update({
      where: { id },
      data: { status: AppointmentStatus.CANCELLED },
    });
  }

  checkin(id: string) {
    return this.prisma.appointment.update({
      where: { id },
      data: { status: AppointmentStatus.CHECKED_IN },
    });
  }
}
