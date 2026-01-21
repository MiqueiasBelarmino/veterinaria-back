import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePlanDto } from './dto/create-plan.dto';
import { UpdatePlanDto } from './dto/update-plan.dto';

@Injectable()
export class PlansService {
  constructor(private prisma: PrismaService) {}

  async create(createPlanDto: CreatePlanDto, organizationId: string) {
    if (!organizationId) throw new Error('Organization context required');

    const { petId, planDefinitionId, ...data } = createPlanDto;

    // Validate Pet and Organization
    const pet = await this.prisma.pet.findUnique({ 
        where: { id: petId },
        include: { client: true }
    });
    
     if (!pet) throw new NotFoundException('Pet not found');

    // Enforce Pet belongs to Org
    if (organizationId && (pet.client as any).organizationId !== organizationId) {
         throw new NotFoundException('Pet not found'); // Hide cross-tenant pets
    }

    const definition = await this.prisma.planDefinition.findUnique({
      where: { id: planDefinitionId },
    });
    if (!definition) throw new NotFoundException('PlanDefinition not found');

    // Enforce Definition belongs to Org
    if (organizationId && (definition as any).organizationId !== organizationId) {
         throw new NotFoundException('PlanDefinition not found');
    }

    return this.prisma.plan.create({
      data: {
        ...data,
        organizationId,
        pet: { connect: { id: petId } },
        definition: { connect: { id: planDefinitionId } },
      },
      include: {
        definition: true,
      },
    });
  }

  async findAllByPet(petId: string, organizationId: string) {
    // Plans have organizationId, so we can filter directly
    const plans = await this.prisma.plan.findMany({
      where: { petId, organizationId }, // Direct filter
      include: {
        definition: true,
        pet: { include: { client: true } }
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return plans;
  }

  async findAllDefinitions(organizationId: string) {
    if (!organizationId) return [];
    
    // Cast any
    const where: any = { isActive: true, organizationId };
    return this.prisma.planDefinition.findMany({
      where,
    });
  }

  async findOne(id: string, organizationId: string) {
    const plan = await this.prisma.plan.findUnique({
      where: { id },
      include: { definition: true, pet: { include: { client: true } } },
    });
    if (!plan) throw new NotFoundException('Plan not found');
    
    if (organizationId && (plan.pet.client as any).organizationId !== organizationId) {
         throw new NotFoundException('Plan not found');
    }

    return plan;
  }

  async update(id: string, updatePlanDto: UpdatePlanDto, organizationId: string) {
    await this.findOne(id, organizationId); // Check permission

    const { petId, planDefinitionId, ...data } = updatePlanDto;
    
    return this.prisma.plan.update({
      where: { id },
      data: {
        ...data,
      },
      include: { definition: true },
    });
  }
}
