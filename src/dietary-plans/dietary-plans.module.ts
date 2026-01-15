import { Module } from '@nestjs/common';
import { DietaryPlansService } from './dietary-plans.service';
import { DietaryPlansController } from './dietary-plans.controller';
import { PrismaService } from '../prisma/prisma.service';
import { ClientsModule } from '../clients/clients.module';

@Module({
  imports: [ClientsModule],
  controllers: [DietaryPlansController],
  providers: [DietaryPlansService, PrismaService],
  exports: [DietaryPlansService],
})
export class DietaryPlansModule {}
