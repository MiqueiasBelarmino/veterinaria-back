import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { CreatePetDto } from './dto/create-pet.dto';
import { UpdatePetDto } from './dto/update-pet.dto';

@Injectable()
@Injectable()
export class PetsService {
  constructor(private prisma: PrismaService) {}

  create(createPetDto: CreatePetDto) {
    const { clientId, ...data } = createPetDto;
    return this.prisma.pet.create({
      data: {
        ...data,
        client: { connect: { id: clientId } },
      },
    });
  }

  findAll() {
    return this.prisma.pet.findMany({
      include: { client: { include: { user: true } } },
    });
  }

  findByClient(clientId: string) {
    return this.prisma.pet.findMany({ where: { clientId } });
  }

  findOne(id: string) {
    return this.prisma.pet.findUnique({
      where: { id },
      include: { appointments: true, prescriptions: true },
    });
  }

  update(id: string, updatePetDto: UpdatePetDto) {
    const { clientId, ...data } = updatePetDto;
    const updateData: Prisma.PetUpdateInput = { ...data };

    if (clientId) {
      updateData.client = { connect: { id: clientId } };
    }

    return this.prisma.pet.update({ where: { id }, data: updateData });
  }

  remove(id: string) {
    return this.prisma.pet.delete({ where: { id } });
  }
}
