import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateClientDto } from './dto/create-client.dto';
import * as bcrypt from 'bcrypt';
import { Prisma } from '@prisma/client';

@Injectable()
export class ClientsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateClientDto, organizationId: string) {
    if (!organizationId) throw new ConflictException('Organização não identificada');

    const { createAccount, password, ...clientData } = dto;

    if (createAccount && password && clientData.email) {
      const existingUser = await this.prisma.user.findUnique({
        where: { email: clientData.email },
      });

      if (existingUser) {
        throw new ConflictException('Usuário com este e-mail já existe');
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      // Cast to any to bypass stale types for organizationId
      const data: any = {
          name: clientData.name,
          email: clientData.email,
          phone: clientData.phone,
          address: clientData.address,
          organization: { connect: { id: organizationId } },
          user: {
            create: {
              email: clientData.email,
              name: clientData.name,
              password: hashedPassword,
              role: 'CLIENT',
            },
          },
      };

      return this.prisma.client.create({
        data,
        include: { user: true },
      });
    }

    const data: any = {
        name: clientData.name,
        email: clientData.email,
        phone: clientData.phone,
        address: clientData.address,
        organization: { connect: { id: organizationId } },
    };

    return this.prisma.client.create({
      data,
      include: { user: true },
    });
  }

  findAll(organizationId: string) {
    if (!organizationId) return [];
    // Cast where clause
    const where: any = { organizationId };
    return this.prisma.client.findMany({
      where,
      include: { user: true, pets: true },
      orderBy: { name: 'asc' },
    });
  }

  findByUserId(userId: string) {
    // This is used internally mostly, might not need strict org filter if IDs are UUIDs, but safety is good.
    // However, findByUserId is usually for looking up the profile of the CURRENT user.
    return this.prisma.client.findUnique({
      where: { userId },
      include: { user: true },
    });
  }

  async findOne(id: string, organizationId: string) {
    const client = await this.prisma.client.findUnique({
      where: { id },
      include: { user: true, pets: true },
    });

    // Cast client to any to access organizationId
    const clientAny = client as any;

    if (!client || (organizationId && clientAny.organizationId !== organizationId)) {
        if (organizationId && clientAny?.organizationId !== organizationId) {
             throw new NotFoundException('Cliente não encontrado');
        }
        if (!client) throw new NotFoundException('Cliente não encontrado');
    }
    return client;
  }

  async update(id: string, data: any, organizationId: string) {
    await this.findOne(id, organizationId); // Verify existence and permission

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

  async remove(id: string, organizationId: string) {
    const client = await this.findOne(id, organizationId); // Ensure ownership

    if (client?.userId) {
      await this.prisma.user.delete({
        where: { id: client.userId },
      });
    }

    return this.prisma.client.delete({
      where: { id },
    });
  }
}
