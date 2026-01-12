import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class SalesService {
  constructor(private prisma: PrismaService) {}

  async create(data: {
    clientId?: string;
    items: { productId: string; quantity: number }[];
  }) {
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

      return tx.sale.create({
        data: {
          clientId: data.clientId,
          total,
          items: {
            create: saleItems,
          },
        },
        include: { items: true },
      });
    });
  }

  findAll() {
    return this.prisma.sale.findMany({
      include: {
        items: { include: { product: true } },
        client: { include: { user: true } },
      },
    });
  }

  findOne(id: string) {
    return this.prisma.sale.findUnique({
      where: { id },
      include: { items: { include: { product: true } } },
    });
  }
}
