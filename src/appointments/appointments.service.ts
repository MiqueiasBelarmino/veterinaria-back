import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AppointmentStatus, AppointmentType, Prisma } from '@prisma/client';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';

@Injectable()
export class AppointmentsService {
  constructor(private prisma: PrismaService) {}

  async create(createAppointmentDto: CreateAppointmentDto, user?: any) {
    const { petId, vetId, ...data } = createAppointmentDto;

    // Security: If user is a CLIENT, check if the pet belongs to them
    if (user && user.role === 'CLIENT' && petId) {
      const client = await this.prisma.client.findUnique({
        where: { userId: user.id },
      });
      if (!client) throw new Error('Client profile not found');

      const pet = await this.prisma.pet.findUnique({
        where: { id: petId },
      });
      if (!pet || pet.clientId !== client.id) {
        throw new Error('This pet does not belong to you');
      }
    }

    const appointmentData: Prisma.AppointmentCreateInput = {
      ...data,
      type: data.type || AppointmentType.INITIAL,
      pet: petId ? { connect: { id: petId } } : undefined,
      vet: vetId ? { connect: { id: vetId } } : undefined,
      status: user?.role === 'CLIENT' ? AppointmentStatus.PENDING : AppointmentStatus.SCHEDULED,
    };

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
    if (created.pet) {
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
        console.error('Failed to create notification:', err);
      }
    }

    return created;
  }

  findAll() {
    return this.prisma.appointment.findMany({
      include: { pet: true, vet: true },
    });
  }

  findAllByClient(userId: string) {
    return this.prisma.appointment.findMany({
      where: {
        pet: {
          client: {
            userId: userId,
          },
        },
      },
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

  async remove(id: string) {
    // Delete dependent notifications first to prevent foreign key errors
    await this.prisma.notification.deleteMany({
      where: { appointmentId: id },
    });

    // Unlink from appointment requests
    await this.prisma.appointmentRequest.updateMany({
      where: { appointmentId: id },
      data: { appointmentId: null },
    });

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

  async confirm(id: string) {
    const appointment = await this.prisma.appointment.findUnique({
      where: { id },
    });

    if (!appointment) throw new Error('Appointment not found');
    if (appointment.status !== AppointmentStatus.PENDING) {
      throw new Error('Only pending appointments can be confirmed');
    }

    return this.prisma.appointment.update({
      where: { id },
      data: { status: AppointmentStatus.SCHEDULED },
    });
  }
}
