import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateClinicDto } from './dto/create-clinic.dto';
import { UpdateClinicDto } from './dto/update-clinic.dto';

@Injectable()
export class ClinicsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateClinicDto) {
    return this.prisma.clinic.create({
      data: {
        name: dto.name,
        address: dto.address,
        phone: dto.phone,
      },
    });
  }

  async findAll() {
    return this.prisma.clinic.findMany({ include: { vets: true } });
  }

  async findOne(id: string) {
    const clinic = await this.prisma.clinic.findUnique({
      where: { id },
      include: { vets: true },
    });
    if (!clinic) throw new NotFoundException('Clinic not found');
    return clinic;
  }

  async update(id: string, dto: UpdateClinicDto) {
    return this.prisma.clinic.update({ where: { id }, data: { ...dto } });
  }

  async remove(id: string) {
    return this.prisma.clinic.delete({ where: { id } });
  }
}
