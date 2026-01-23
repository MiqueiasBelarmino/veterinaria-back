import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../../prisma/prisma.service';
import { ClientsService } from '../../clients/clients.service';

export interface OwnershipCheckOptions {
  paramName: string;
  resourceType:
    | 'pet'
    | 'exam'
    | 'dietaryPlan'
    | 'educationalMaterial'
    | 'appointment';
}

@Injectable()
export class OwnershipGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
    private clientsService: ClientsService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const options = this.reflector.get<OwnershipCheckOptions>(
      'ownershipCheck',
      context.getHandler(),
    );
    if (!options) return true;

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

    if (
      user.memberRole === 'VET' ||
      user.memberRole === 'ADMIN' ||
      user.memberRole === 'OWNER'
    ) {
      return true;
    }

    if (user.memberRole === 'CLIENT') {
      const isOwner = await this.validateClientOwnership(
        user.id,
        resourceId,
        resourceType,
        user.activeOrganizationId,
      );
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
      const clients = await this.clientsService.findByUserId(userId);
      if (!clients || clients.length === 0) return false;
      client = clients[0];
    }

    if (!client) return false;

    switch (resourceType) {
      case 'pet': {
        const pet = await this.prisma.pet.findFirst({ 
          where: { id: resourceId, organizationId: organizationId || undefined } 
        });
        return pet?.clientId === client.id;
      }

      case 'exam': {
        const exam = await this.prisma.laboratoryExam.findFirst({
          where: { id: resourceId, organizationId: organizationId || undefined },
          include: { pet: true },
        });
        return exam?.pet?.clientId === client.id;
      }

      case 'dietaryPlan': {
        const plan = await this.prisma.dietaryPlan.findFirst({
          where: { id: resourceId, organizationId: organizationId || undefined },
          include: { pet: true },
        });
        return plan?.pet?.clientId === client.id;
      }

      case 'educationalMaterial': {
        const material = await this.prisma.educationalMaterial.findFirst({
          where: { id: resourceId, organizationId: organizationId || undefined },
          include: { pets: true },
        });
        if (!material) return false;
        return material.pets.some((pet) => pet.clientId === client.id);
      }

      case 'appointment': {
        const appointment = await this.prisma.appointment.findFirst({
          where: { id: resourceId, organizationId: organizationId || undefined },
          include: { pet: true },
        });
        return appointment?.pet?.clientId === client.id;
      }

      default:
        return false;
    }
  }
}
