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

      const client = await this.prisma.client.create({
        data: {
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
              // global access handled by organization membership
            },
          },
        },
        include: { user: true },
      });

      if (client.userId) {
        await this.prisma.organizationMember.create({
          data: {
            organizationId,
            userId: client.userId,
            role: 'CLIENT',
            status: 'ACTIVE',
          },
        });
      }

      return client;
    }

    return this.prisma.client.create({
      data: {
         name: clientData.name,
         email: clientData.email,
         phone: clientData.phone,
         address: clientData.address,
         organization: { connect: { id: organizationId } },
      },
      include: { user: true },
    });
  }

  findAll(organizationId: string) {
    if (!organizationId) return [];
    return this.prisma.client.findMany({
      where: { organizationId },
      include: { user: true, pets: true },
      orderBy: { name: 'asc' },
    });
  }

  // Deprecated/Modified: Returns first found (not strict) or all?
  // We need strict lookup now.
  async findByUserAndOrg(userId: string, organizationId: string) {
    return this.prisma.client.findFirst({
        where: { userId, organizationId },
        include: { user: true }
    });
  }

  findByUserId(userId: string) {
      // Return all client profiles for this user (across orgs)
      return this.prisma.client.findMany({
          where: { userId },
          include: { organization: true }
      });
  }

  async findOne(id: string, organizationId: string) {
    const client = await this.prisma.client.findUnique({
      where: { id },
      include: { user: true, pets: true },
    });

    if (!client || (organizationId && client.organizationId !== organizationId)) {
        throw new NotFoundException('Cliente não encontrado');
    }
    return client;
  }

  async update(id: string, data: any, organizationId: string) {
    await this.findOne(id, organizationId); // Verify existence and permission

    const { createAccount, password, ...clientData } = data;

    // Fetch current state
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
        },
      });

      clientData.userId = newUser.id;
      await this.prisma.organizationMember.create({
        data: {
          organizationId,
          userId: newUser.id,
          role: 'CLIENT',
          status: 'ACTIVE',
        },
      });
    }

    return this.prisma.client.update({
      where: { id },
      data: clientData,
      include: { user: true },
    });
  }

  async remove(id: string, organizationId: string) {
    const client = await this.findOne(id, organizationId);

    if (client?.userId) {
      // Optional: Delete the User account too? 
      // In Multi-tenant, we should NOT delete the User if they belong to other orgs or have other data.
      // But for Client-System where User is 1:1 with Client logic (legacy), we did.
      // Now User can be shared.
      // Check if User acts as Client/Member elsewhere?
      // Safer to NOT delete User automatically, or only if it has NO other relations.
      // For now, I will COMMENT OUT User deletion to be safe/compliant with Multi-tenant.
      // await this.prisma.user.delete({ where: { id: client.userId } });
    }

    return this.prisma.client.delete({
      where: { id },
    });
  }
}
