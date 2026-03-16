import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEducationalMaterialDto } from './dto/create-educational-material.dto';
import { UpdateEducationalMaterialDto } from './dto/update-educational-material.dto';

@Injectable()
export class EducationalMaterialsService {
  constructor(private prisma: PrismaService) {}

  create(createDto: CreateEducationalMaterialDto) {
    const { petIds, appointmentIds, ...data } = createDto;

    return this.prisma.educationalMaterial.create({
      data: {
        ...data,
        pets: {
          connect: petIds?.map((id) => ({ id })),
        },
        appointments: {
          connect: appointmentIds?.map((id) => ({ id })),
        },
      },
    });
  }

  findAll() {
    return this.prisma.educationalMaterial.findMany({
      include: {
        pets: true,
        appointments: true,
      },
    });
  }

  async findOne(id: string) {
    const material = await this.prisma.educationalMaterial.findUnique({
      where: { id: id },
      include: {
        pets: true,
        appointments: true,
      },
    });

    if (!material) {
      throw new NotFoundException(
        `Educational material with ID ${id} not found`,
      );
    }

    return material;
  }

  async update(id: string, updateDto: UpdateEducationalMaterialDto) {
    const { petIds, appointmentIds, ...data } = updateDto;

    return this.prisma.educationalMaterial.update({
      where: { id },
      data: {
        ...data,
        pets: petIds ? { set: petIds.map((id) => ({ id })) } : undefined,
        appointments: appointmentIds
          ? { set: appointmentIds.map((id) => ({ id })) }
          : undefined,
      },
    });
  }

  remove(id: string) {
    return this.prisma.educationalMaterial.delete({
      where: { id },
    });
  }

  /**
   * Finds all materials relevant to a specific pet.
   * This includes:
   * 1. Materials directly linked to the pet.
   * 2. Materials linked to any of the pet's appointments.
   * 3. Materials linked to the pet's active plan's definition.
   */
  async findByPet(petId: string) {
    // 1. Get pet with active plans and appointments
    const pet = await this.prisma.pet.findUnique({
      where: { id: petId },
      include: {
        appointments: true,
      },
    });

    if (!pet) {
      throw new NotFoundException(`Pet with ID ${petId} not found`);
    }

    const appointmentIds = pet.appointments.map((a) => a.id);

    return this.prisma.educationalMaterial.findMany({
      where: {
        OR: [
          { pets: { some: { id: petId } } },
          { appointments: { some: { id: { in: appointmentIds } } } },
        ],
      },
    });
  }
}
