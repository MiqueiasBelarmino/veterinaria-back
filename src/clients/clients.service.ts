import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateClientDto } from './dto/create-client.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class ClientsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateClientDto) {
    const { createAccount, password, ...clientData } = dto;

    if (createAccount && password && clientData.email) {
      // Check if user already exists
      const existingUser = await this.prisma.user.findUnique({
        where: { email: clientData.email },
      });

      if (existingUser) {
        throw new ConflictException('Usuário com este e-mail já existe');
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      return this.prisma.client.create({
        data: {
          name: clientData.name,
          email: clientData.email,
          phone: clientData.phone,
          address: clientData.address,
          user: {
            create: {
              email: clientData.email,
              name: clientData.name,
              password: hashedPassword,
              role: 'CLIENT',
            },
          },
        },
        include: { user: true },
      });
    }

    return this.prisma.client.create({
      data: {
        name: clientData.name,
        email: clientData.email,
        phone: clientData.phone,
        address: clientData.address,
      },
      include: { user: true },
    });
  }

  findAll() {
    return this.prisma.client.findMany({
      include: { user: true, pets: true },
      orderBy: { name: 'asc' },
    });
  }

  findOne(id: string) {
    return this.prisma.client.findUnique({
      where: { id },
      include: { user: true, pets: true },
    });
  }

  update(id: string, data: any) {
    return this.prisma.client.update({
      where: { id },
      data,
      include: { user: true },
    });
  }
}
