import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateClinicalRecordDto } from './dto/create-clinical-record.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class ClinicalRecordsService {
  constructor(private prisma: PrismaService) {}

  async create(createClinicalRecordDto: CreateClinicalRecordDto) {
    const { petId, appointmentId, planId, ...data } = createClinicalRecordDto;

    const pet = await this.prisma.pet.findUnique({ where: { id: petId } });
    if (!pet) throw new NotFoundException('Pet not found');

    const recordData: Prisma.ClinicalRecordCreateInput = {
      ...data,
      pet: { connect: { id: petId } },
    };

    if (appointmentId) {
      recordData.appointment = { connect: { id: appointmentId } };
    }

    if (planId) {
      recordData.plan = { connect: { id: planId } };
    }

    return this.prisma.clinicalRecord.create({
      data: recordData,
      include: { appointment: true, plan: { include: { definition: true } } },
    });
  }

  async findAllByPet(petId: string) {
    return this.prisma.clinicalRecord.findMany({
      where: { petId },
      include: {
        appointment: true,
        plan: { include: { definition: true } },
      },
      orderBy: { date: 'desc' },
    });
  }
}
