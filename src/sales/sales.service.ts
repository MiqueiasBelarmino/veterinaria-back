import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class SalesService {
  constructor(private prisma: PrismaService) {}

  async create(data: {
    clientId?: string;
    items: { productId: string; quantity: number }[];
  }, organizationId: string) {
    if (!organizationId) throw new Error('Organization context required');

    return this.prisma.$transaction(async (tx) => {
      let total = 0;
      const saleItems: {
        productId: string;
        quantity: number;
        price: number;
      }[] = [];

      for (const item of data.items) {
        const product = await tx.product.findUnique({
          where: { id: item.productId },
        });

        if (!product)
          throw new Error(`Produto ${item.productId} não encontrado`);
        
        // Enforce organization scope on products
        if ((product as any).organizationId !== organizationId) {
             throw new Error(`Produto ${product.name} não pertence à organização atual`);
        }

        if (product.stock < item.quantity) {
          throw new Error(
            `Estoque insuficiente para o produto: ${product.name}`,
          );
        }

        // Reduce stock
        await tx.product.update({
          where: { id: product.id },
          data: { stock: { decrement: item.quantity } },
        });

        const itemTotal = product.price * item.quantity;
        total += itemTotal;

        saleItems.push({
          productId: product.id,
          quantity: item.quantity,
          price: product.price,
        });
      }

      // Cast to any for organizationId
      const saleData: any = {
          clientId: data.clientId,
          total,
          organization: { connect: { id: organizationId } },
          items: {
            create: saleItems,
          },
      };

      return tx.sale.create({
        data: saleData,
        include: { items: true },
      });
    });
  }

  findAll(organizationId: string) {
    if (!organizationId) return [];
    
    // Cast where clause
    const where: any = { organizationId };

    return this.prisma.sale.findMany({
      where,
      include: {
        items: { include: { product: true } },
        client: { include: { user: true } },
      },
    });
  }

  async findOne(id: string, organizationId: string) {
    const sale = await this.prisma.sale.findUnique({
      where: { id },
      include: { items: { include: { product: true } } },
    });

    if (sale && organizationId && (sale as any).organizationId !== organizationId) {
        return null;
    }
    return sale;
  }
}
