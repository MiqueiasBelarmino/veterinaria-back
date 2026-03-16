import {
  Controller,
  Get,
  Param,
  UseGuards,
  NotFoundException,
} from '@nestjs/common';
import { DietaryPlansService } from './dietary-plans.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OwnershipGuard } from '../auth/guards/ownership.guard';
import { CheckOwnership } from '../auth/decorators/check-ownership.decorator';

@Controller('plans')
@UseGuards(JwtAuthGuard, OwnershipGuard)
export class PlansDietaryController {
  constructor(private readonly dietaryPlansService: DietaryPlansService) {}

  @Get('pet/:petId')
  @CheckOwnership({ paramName: 'petId', resourceType: 'pet' })
  async findActiveByPet(@Param('petId') petId: string) {
    const plan = await this.dietaryPlansService.findActiveByPet(petId);
    if (!plan) {
      throw new NotFoundException('No active dietary plan found for this pet');
    }
    return plan;
  }
}
