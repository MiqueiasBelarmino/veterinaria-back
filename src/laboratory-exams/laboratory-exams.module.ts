import { Module } from '@nestjs/common';
import { LaboratoryExamsService } from './laboratory-exams.service';
import { LaboratoryExamsController } from './laboratory-exams.controller';
import { PrismaService } from '../prisma/prisma.service';
import { ClientsModule } from '../clients/clients.module';

@Module({
  imports: [ClientsModule],
  controllers: [LaboratoryExamsController],
  providers: [LaboratoryExamsService, PrismaService],
  exports: [LaboratoryExamsService],
})
export class LaboratoryExamsModule {}
