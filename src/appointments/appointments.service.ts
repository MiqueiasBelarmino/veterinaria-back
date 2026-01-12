import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';

@Injectable()
export class AppointmentsService {
  constructor(private prisma: PrismaService) {}

  async create(createAppointmentDto: CreateAppointmentDto) {
    const { petId, planId, ...data } = createAppointmentDto;

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
    };

    if (planId) {
      appointmentData.plan = { connect: { id: planId } };
    }

    return this.prisma.appointment.create({
      data: appointmentData,
    });
  }

  findAll() {
    return this.prisma.appointment.findMany({ include: { pet: true } });
  }

  findOne(id: string) {
    return this.prisma.appointment.findUnique({
      where: { id },
      include: { pet: true, prescription: true },
    });
  }

  update(id: string, updateAppointmentDto: UpdateAppointmentDto) {
    const { petId, ...data } = updateAppointmentDto;
    const updateData: Prisma.AppointmentUpdateInput = { ...data };

    if (petId) {
      updateData.pet = { connect: { id: petId } };
    }

    return this.prisma.appointment.update({ where: { id }, data: updateData });
  }

  remove(id: string) {
    return this.prisma.appointment.delete({ where: { id } });
  }
}
