import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePlanDto } from './dto/create-plan.dto';
import { UpdatePlanDto } from './dto/update-plan.dto';

@Injectable()
export class PlansService {
  constructor(private prisma: PrismaService) {}

  async create(createPlanDto: CreatePlanDto) {
    const { petId, planDefinitionId, ...data } = createPlanDto;

    // Validate existence
    const pet = await this.prisma.pet.findUnique({ where: { id: petId } });
    if (!pet) throw new NotFoundException('Pet not found');

    const definition = await this.prisma.planDefinition.findUnique({
      where: { id: planDefinitionId },
    });
    if (!definition) throw new NotFoundException('PlanDefinition not found');

    return this.prisma.plan.create({
      data: {
        ...data,
        pet: { connect: { id: petId } },
        definition: { connect: { id: planDefinitionId } },
      },
      include: {
        definition: true,
      },
    });
  }

  async findAllByPet(petId: string) {
    return this.prisma.plan.findMany({
      where: { petId },
      include: {
        definition: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findAllDefinitions() {
    return this.prisma.planDefinition.findMany({
      where: { isActive: true },
    });
  }

  async findOne(id: string) {
    const plan = await this.prisma.plan.findUnique({
      where: { id },
      include: { definition: true, pet: true },
    });
    if (!plan) throw new NotFoundException('Plan not found');
    return plan;
  }

  async update(id: string, updatePlanDto: UpdatePlanDto) {
    const { petId, planDefinitionId, ...data } = updatePlanDto;
    // Note: Switching pet or definition is rare but possible if implemented.
    // For now just update fields.

    return this.prisma.plan.update({
      where: { id },
      data: {
        ...data,
      },
      include: { definition: true },
    });
  }
}
