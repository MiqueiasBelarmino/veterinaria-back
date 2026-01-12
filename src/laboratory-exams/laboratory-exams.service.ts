import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLaboratoryExamDto } from './dto/create-laboratory-exam.dto';
import { UpdateLaboratoryExamDto } from './dto/update-laboratory-exam.dto';

@Injectable()
export class LaboratoryExamsService {
  constructor(private prisma: PrismaService) {}

  async create(createDto: CreateLaboratoryExamDto) {
    const { petId, planId, ...data } = createDto;

    const pet = await this.prisma.pet.findUnique({ where: { id: petId } });
    if (!pet) throw new NotFoundException('Pet not found');

    if (planId) {
      const plan = await this.prisma.plan.findUnique({ where: { id: planId } });
      if (!plan) throw new NotFoundException('Plan not found');
    }

    return this.prisma.laboratoryExam.create({
      data: {
        ...data,
        pet: { connect: { id: petId } },
        ...(planId && { plan: { connect: { id: planId } } }),
      },
    });
  }

  findAll() {
    return this.prisma.laboratoryExam.findMany({
      include: { pet: true, plan: { include: { definition: true } } },
    });
  }

  findByPet(petId: string) {
    return this.prisma.laboratoryExam.findMany({
      where: { petId },
      include: { plan: { include: { definition: true } } },
      orderBy: { date: 'desc' },
    });
  }

  findByPlan(planId: string) {
    return this.prisma.laboratoryExam.findMany({
      where: { planId },
      include: { pet: true },
      orderBy: { date: 'desc' },
    });
  }

  async findOne(id: string) {
    const exam = await this.prisma.laboratoryExam.findUnique({
      where: { id },
      include: { pet: true, plan: { include: { definition: true } } },
    });
    if (!exam) throw new NotFoundException('Exam not found');
    return exam;
  }

  async update(id: string, updateDto: UpdateLaboratoryExamDto) {
    const { petId, planId, ...data } = updateDto;

    const exam = await this.prisma.laboratoryExam.findUnique({ where: { id } });
    if (!exam) throw new NotFoundException('Exam not found');

    return this.prisma.laboratoryExam.update({
      where: { id },
      data: {
        ...data,
        ...(petId && { pet: { connect: { id: petId } } }),
        ...(planId && { plan: { connect: { id: planId } } }),
      },
    });
  }

  async remove(id: string) {
    const exam = await this.prisma.laboratoryExam.findUnique({ where: { id } });
    if (!exam) throw new NotFoundException('Exam not found');
    return this.prisma.laboratoryExam.delete({ where: { id } });
  }
}
