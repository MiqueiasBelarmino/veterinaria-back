import { Module } from '@nestjs/common';
import { DietaryPlansService } from './dietary-plans.service';
import { DietaryPlansController } from './dietary-plans.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [DietaryPlansController],
  providers: [DietaryPlansService, PrismaService],
  exports: [DietaryPlansService],
})
export class DietaryPlansModule {}
