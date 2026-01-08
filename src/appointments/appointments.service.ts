import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class AppointmentsService {
  constructor(private prisma: PrismaService) {}

  create(data: Prisma.AppointmentCreateInput) {
    return this.prisma.appointment.create({ data });
  }

  findAll() {
    return this.prisma.appointment.findMany({ include: { pet: true } });
  }

  findOne(id: string) {
    return this.prisma.appointment.findUnique({ where: { id }, include: { pet: true, prescription: true } });
  }

  update(id: string, data: Prisma.AppointmentUpdateInput) {
    return this.prisma.appointment.update({ where: { id }, data });
  }

  remove(id: string) {
    return this.prisma.appointment.delete({ where: { id } });
  }
}
