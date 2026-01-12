import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';

@Injectable()
export class AppointmentsService {
  constructor(private prisma: PrismaService) {}

  create(createAppointmentDto: CreateAppointmentDto) {
    const { petId, ...data } = createAppointmentDto;
    return this.prisma.appointment.create({
      data: {
        ...data,
        pet: { connect: { id: petId } },
      },
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
