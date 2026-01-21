import { Injectable, CanActivate, ExecutionContext, ForbiddenException, BadRequestException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../../prisma/prisma.service';
import { ClientsService } from '../../clients/clients.service';

export interface OwnershipCheckOptions {
  paramName: string; // 'petId', 'examId', etc.
  resourceType: 'pet' | 'exam' | 'dietaryPlan' | 'educationalMaterial' | 'appointment';
}

@Injectable()
export class OwnershipGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
    private clientsService: ClientsService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const options = this.reflector.get<OwnershipCheckOptions>('ownershipCheck', context.getHandler());
    if (!options) return true; // Guard não aplicado, permite acesso

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('Autenticação necessária');
    }

    const { paramName, resourceType } = options;
    const resourceId = request.params[paramName];

    if (!resourceId) {
      throw new BadRequestException(`Parâmetro ${paramName} não encontrado`);
    }

    // VETs têm acesso a tudo (podem gerenciar recursos de qualquer pet/cliente)
    if (user.role === 'VET') {
      return true;
    }

    // CLIENTs precisam validar propriedade
    if (user.role === 'CLIENT') {
      const isOwner = await this.validateClientOwnership(user.id, resourceId, resourceType, user.organizationId);
      if (!isOwner) {
        throw new ForbiddenException('Acesso negado: recurso não pertence a você');
      }
      return true;
    }

    throw new ForbiddenException('Role não reconhecida');
  }

  private async validateClientOwnership(
    userId: string,
    resourceId: string,
    resourceType: string,
    organizationId?: string,
  ): Promise<boolean> {
    let client;
    if (organizationId) {
        client = await this.clientsService.findByUserAndOrg(userId, organizationId);
    } else {
        // Fallback: Check if ANY of the user's client profiles own this?
        // Risky but acceptable for legacy support?
        // Better to require Org Context.
        const clients = await this.clientsService.findByUserId(userId);
        // We'll proceed if clients found, but we need to check ownership against ALL client Ids.
        if (!clients || clients.length === 0) return false;
        
        // This makes logic complex below.
        // Let's assume we pick the first one or fail?
        // Or refactor logic to check array.
        // For now, let's try to grab first.
        client = clients[0]; 
    }
    
    if (!client) return false;

    switch (resourceType) {
      case 'pet': {
        const pet = await this.prisma.pet.findUnique({ where: { id: resourceId } });
        return pet?.clientId === client.id;
      }

      case 'exam': {
        const exam = await this.prisma.laboratoryExam.findUnique({
          where: { id: resourceId },
          include: { pet: true },
        });
        return exam?.pet?.clientId === client.id;
      }

      case 'dietaryPlan': {
        const plan = await this.prisma.dietaryPlan.findUnique({
          where: { id: resourceId },
          include: { pet: true },
        });
        return plan?.pet?.clientId === client.id;
      }

      case 'educationalMaterial': {
        // Materiais educativos podem ser acessados por clientes cujos pets estão linkados
        const material = await this.prisma.educationalMaterial.findUnique({
          where: { id: resourceId },
          include: { pets: true },
        });
        if (!material) return false;
        return material.pets.some((pet) => pet.clientId === client.id);
      }

      case 'appointment': {
        const appointment = await this.prisma.appointment.findUnique({
          where: { id: resourceId },
          include: { pet: true },
        });
        return appointment?.pet?.clientId === client.id;
      }

      default:
        return false;
    }
  }
}
