import { Module } from '@nestjs/common';
import { LaboratoryExamsService } from './laboratory-exams.service';
import { LaboratoryExamsController } from './laboratory-exams.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [LaboratoryExamsController],
  providers: [LaboratoryExamsService, PrismaService],
  exports: [LaboratoryExamsService],
})
export class LaboratoryExamsModule {}
