import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class PetsService {
  constructor(private prisma: PrismaService) {}

  create(data: Prisma.PetCreateInput) {
    return this.prisma.pet.create({ data });
  }

  findAll() {
    return this.prisma.pet.findMany({ include: { client: { include: { user: true } } } });
  }

  findByClient(clientId: string) {
    return this.prisma.pet.findMany({ where: { clientId } });
  }

  findOne(id: string) {
    return this.prisma.pet.findUnique({ where: { id }, include: { appointments: true, prescriptions: true } });
  }

  update(id: string, data: Prisma.PetUpdateInput) {
    return this.prisma.pet.update({ where: { id }, data });
  }

  remove(id: string) {
    return this.prisma.pet.delete({ where: { id } });
  }
}
