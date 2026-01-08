import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class PrescriptionsService {
  constructor(private prisma: PrismaService) {}

  create(data: Prisma.PrescriptionCreateInput) {
    return this.prisma.prescription.create({ data });
  }

  findAll() {
    return this.prisma.prescription.findMany({ include: { pet: true, items: true, vet: true } });
  }

  findOne(id: string) {
    return this.prisma.prescription.findUnique({ where: { id }, include: { items: true, pet: true } });
  }
}
