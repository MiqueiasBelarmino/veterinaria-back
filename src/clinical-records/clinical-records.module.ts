import { Module } from '@nestjs/common';
import { ClinicalRecordsService } from './clinical-records.service';
import { ClinicalRecordsController } from './clinical-records.controller';
import { PrismaService } from '../prisma/prisma.service';
import { ClientsModule } from '../clients/clients.module';

@Module({
  imports: [ClientsModule],
  controllers: [ClinicalRecordsController],
  providers: [ClinicalRecordsService, PrismaService],
  exports: [ClinicalRecordsService],
})
export class ClinicalRecordsModule {}
