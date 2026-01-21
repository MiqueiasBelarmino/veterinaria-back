import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  create(data: Prisma.ProductCreateInput, organizationId: string) {
    if (!organizationId) throw new Error('Organization context required');
    
    // Cast to any to inject organizationId
    const dataWithOrg: any = {
        ...data,
        organizationId,
    };
    return this.prisma.product.create({ data: dataWithOrg });
  }

  findAll(organizationId: string) {
    if (!organizationId) return [];
    const where: any = { organizationId };
    return this.prisma.product.findMany({ where });
  }

  async findOne(id: string, organizationId: string) {
    const product = await this.prisma.product.findUnique({ where: { id } });
    if (product && organizationId && (product as any).organizationId !== organizationId) {
        return null; // Or throw NotFound
    }
    return product;
  }
}
