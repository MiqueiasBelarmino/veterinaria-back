import { Module } from '@nestjs/common';
import { EducationalMaterialsService } from './educational-materials.service';
import { EducationalMaterialsController } from './educational-materials.controller';
import { PrismaService } from '../prisma/prisma.service';
import { ClientsModule } from '../clients/clients.module';

@Module({
  imports: [ClientsModule],
  controllers: [EducationalMaterialsController],
  providers: [EducationalMaterialsService, PrismaService],
})
export class EducationalMaterialsModule {}
