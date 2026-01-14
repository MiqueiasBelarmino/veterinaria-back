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

  findByUserId(userId: string) {
    return this.prisma.client.findUnique({
      where: { userId },
      include: { user: true },
    });
  }

  findOne(id: string) {
    return this.prisma.client.findUnique({
      where: { id },
      include: { user: true, pets: true },
    });
  }

  async update(id: string, data: any) {
    const { createAccount, password, ...clientData } = data;

    // Fetch current state to check for existing user
    const client = await this.prisma.client.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!client) {
      throw new Error('Cliente não encontrado');
    }

    const emailToUse = clientData.email || client.email;

    // Handle late account creation
    if (createAccount && password && !client.user && emailToUse) {
      // Check if user already exists
      const existingUser = await this.prisma.user.findUnique({
        where: { email: emailToUse },
      });

      if (existingUser) {
        throw new ConflictException('Usuário com este e-mail já existe');
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const newUser = await this.prisma.user.create({
        data: {
          email: emailToUse,
          name: clientData.name || client.name,
          password: hashedPassword,
          role: 'CLIENT',
        },
      });

      // Link the new user to the clientData payload
      clientData.userId = newUser.id;
    }

    return this.prisma.client.update({
      where: { id },
      data: clientData,
      include: { user: true },
    });
  }

  async remove(id: string) {
    const client = await this.prisma.client.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (client?.userId) {
      // Deleting the user will set client.userId to null due to SetNull in schema
      // but we want to delete the client anyway.
      await this.prisma.user.delete({
        where: { id: client.userId },
      });
    }

    return this.prisma.client.delete({
      where: { id },
    });
  }
}
