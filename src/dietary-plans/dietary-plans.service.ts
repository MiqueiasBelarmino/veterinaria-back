import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDietaryPlanDto } from './dto/create-dietary-plan.dto';
import { UpdateDietaryPlanDto } from './dto/update-dietary-plan.dto';

@Injectable()
export class DietaryPlansService {
  constructor(private prisma: PrismaService) {}

  async create(createDto: CreateDietaryPlanDto) {
    const { petId, planId, meals, ...data } = createDto;

    // Verify pet
    const pet = await this.prisma.pet.findUnique({ where: { id: petId } });
    if (!pet) throw new NotFoundException('Pet not found');

    // Handle versioning: Deactivate current active plan for this pet
    const currentActive = await this.prisma.dietaryPlan.findFirst({
      where: { petId, isActive: true },
      orderBy: { version: 'desc' },
    });

    let nextVersion = 1;
    if (currentActive) {
      nextVersion = currentActive.version + 1;
      await this.prisma.dietaryPlan.update({
        where: { id: currentActive.id },
        data: { isActive: false },
      });
    }

    // Create new version
    return this.prisma.dietaryPlan.create({
      data: {
        ...data,
        version: nextVersion,
        isActive: true,
        pet: { connect: { id: petId } },
        ...(planId && { plan: { connect: { id: planId } } }),
        meals: {
          create: meals.map((meal) => ({
            name: meal.name,
            time: meal.time,
            order: meal.order || 0,
            items: {
              create: meal.items.map((item) => ({
                foodName: item.foodName,
                quantity: item.quantity,
                unit: item.unit,
                frequency: item.frequency,
                notes: item.notes,
                substitutions: item.substitutions,
                combinations: item.combinations,
              })),
            },
          })),
        },
      },
      include: {
        meals: {
          include: {
            items: true,
          },
        },
      },
    });
  }

  findAllByPet(petId: string) {
    return this.prisma.dietaryPlan.findMany({
      where: { petId },
      include: {
        meals: {
          include: {
            items: true,
          },
        },
      },
      orderBy: { version: 'desc' },
    });
  }

  async findActiveByPet(petId: string) {
    return this.prisma.dietaryPlan.findFirst({
      where: { petId, isActive: true },
      include: {
        meals: {
          include: {
            items: true,
          },
        },
      },
    });
  }

  async findOne(id: string) {
    const plan = await this.prisma.dietaryPlan.findUnique({
      where: { id },
      include: {
        meals: {
          include: {
            items: true,
          },
        },
      },
    });
    if (!plan) throw new NotFoundException('Dietary plan not found');
    return plan;
  }
}
