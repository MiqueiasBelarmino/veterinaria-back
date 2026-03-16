import { Module } from '@nestjs/common';
import { ClinicsService } from './clinics.service';
import { ClinicsController } from './clinics.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [ClinicsController],
  providers: [ClinicsService, PrismaService],
  exports: [ClinicsService],
})
export class ClinicsModule {}
