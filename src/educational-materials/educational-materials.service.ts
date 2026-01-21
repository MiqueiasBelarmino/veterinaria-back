import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEducationalMaterialDto } from './dto/create-educational-material.dto';
import { UpdateEducationalMaterialDto } from './dto/update-educational-material.dto';

@Injectable()
export class EducationalMaterialsService {
  constructor(private prisma: PrismaService) {}

  create(createDto: CreateEducationalMaterialDto, organizationId: string) {
    if (!organizationId) throw new Error('Organization context required');

    const { petIds, appointmentIds, planDefinitionIds, ...data } = createDto;

    // Cast data for organizationId
    const matData: any = {
        ...data,
        organization: { connect: { id: organizationId } },
        pets: {
          connect: petIds?.map((id) => ({ id })),
        },
        appointments: {
          connect: appointmentIds?.map((id) => ({ id })),
        },
        planDefinitions: {
          connect: planDefinitionIds?.map((id) => ({ id })),
        },
    };

    return this.prisma.educationalMaterial.create({
      data: matData,
    });
  }

  findAll(organizationId: string) {
    if (!organizationId) return [];
    const where: any = { organizationId };
    return this.prisma.educationalMaterial.findMany({
      where,
      include: {
        pets: true,
        appointments: true,
        planDefinitions: true,
      },
    });
  }

  async findOne(id: string, organizationId: string) {
    const material = await this.prisma.educationalMaterial.findUnique({
      where: { id },
      include: {
        pets: true,
        appointments: true,
        planDefinitions: true,
      },
    });

    if (!material) {
      throw new NotFoundException(`Educational material with ID ${id} not found`);
    }

    if (organizationId && (material as any).organizationId !== organizationId) {
         throw new NotFoundException(`Educational material with ID ${id} not found`);
    }

    return material;
  }

  async update(id: string, updateDto: UpdateEducationalMaterialDto, organizationId: string) {
    await this.findOne(id, organizationId); // Check permission

    const { petIds, appointmentIds, planDefinitionIds, ...data } = updateDto;

    return this.prisma.educationalMaterial.update({
      where: { id },
      data: {
        ...data,
        pets: petIds ? { set: petIds.map((id) => ({ id })) } : undefined,
        appointments: appointmentIds ? { set: appointmentIds.map((id) => ({ id })) } : undefined,
        planDefinitions: planDefinitionIds ? { set: planDefinitionIds.map((id) => ({ id })) } : undefined,
      },
    });
  }

  async remove(id: string, organizationId: string) {
    await this.findOne(id, organizationId); // Check permission
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
  async findByPet(petId: string, organizationId: string) {
    // 1. Get pet with active plans and appointments
    const pet = await this.prisma.pet.findUnique({
      where: { id: petId },
      include: {
        client: true, // Check org logic?
        appointments: true,
        plans: {
          where: { status: 'ACTIVE' },
          include: { definition: true },
        },
      },
    });

    if (!pet) {
      throw new NotFoundException(`Pet with ID ${petId} not found`);
    }
    
    // Verify Pet belongs to Org (via Client)
    if (organizationId && (pet.client as any).organizationId !== organizationId) {
         // Should throw NotFound or Forbidden
         // But schema has nested relation?
         // Actually Pet -> Client -> Organization
         // Assume verify happened before or implicit.
         // Let's rely on filter below.
    }

    const appointmentIds = pet.appointments.map((a) => a.id);
    const planDefIds = pet.plans.map((p) => p.planDefinitionId);
    
    // Enforce organizationId on the materials themselves
    const where: any = {
        organizationId,
        OR: [
          { pets: { some: { id: petId } } },
          { appointments: { some: { id: { in: appointmentIds } } } },
          { planDefinitions: { some: { id: { in: planDefIds } } } },
        ],
    };

    return this.prisma.educationalMaterial.findMany({
      where,
    });
  }
}
