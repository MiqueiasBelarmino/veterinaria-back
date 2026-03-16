import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLaboratoryExamDto } from './dto/create-laboratory-exam.dto';
import { UpdateLaboratoryExamDto } from './dto/update-laboratory-exam.dto';

@Injectable()
export class LaboratoryExamsService {
  constructor(private prisma: PrismaService) {}

  async create(createDto: CreateLaboratoryExamDto) {
    const { petId, ...data } = createDto;

    const pet = await this.prisma.pet.findUnique({ where: { id: petId } });
    if (!pet) throw new NotFoundException('Pet not found');


    return this.prisma.laboratoryExam.create({
      data: {
        ...data,
        pet: { connect: { id: petId } },
      },
    });
  }

  findAll() {
    return this.prisma.laboratoryExam.findMany({
      include: { pet: true },
    });
  }

  findByPet(petId: string) {
    return this.prisma.laboratoryExam.findMany({
      where: { petId },
      orderBy: { date: 'desc' },
    });
  }


  async findOne(id: string) {
    const exam = await this.prisma.laboratoryExam.findUnique({
      where: { id },
      include: { pet: true },
    });
    if (!exam) throw new NotFoundException('Exam not found');
    return exam;
  }

  async update(id: string, updateDto: UpdateLaboratoryExamDto) {
    const { petId, ...data } = updateDto;

    const exam = await this.prisma.laboratoryExam.findUnique({ where: { id } });
    if (!exam) throw new NotFoundException('Exam not found');

    return this.prisma.laboratoryExam.update({
      where: { id },
      data: {
        ...data,
        ...(petId && { pet: { connect: { id: petId } } }),
      },
    });
  }

  async remove(id: string) {
    const exam = await this.prisma.laboratoryExam.findUnique({ where: { id } });
    if (!exam) throw new NotFoundException('Exam not found');
    return this.prisma.laboratoryExam.delete({ where: { id } });
  }
}
