import { PrismaClient } from '@prisma/client';

export async function seedProducts(prisma: PrismaClient, organizationId: string) {
  console.log('Seeding Products...');
  
  const products = [
    { name: 'Ração Adulto 10kg', price: 180.00, stock: 20, category: 'Alimentação', organizationId },
    { name: 'Shampoo Neutro 500ml', price: 35.00, stock: 15, category: 'Higiene', organizationId },
    { name: 'Vacina V10', price: 120.00, stock: 50, category: 'Medicamento', organizationId },
    { name: 'Vermífugo Plus', price: 45.00, stock: 30, category: 'Medicamento', organizationId },
    { name: 'Coleira Antipulgas', price: 90.00, stock: 10, category: 'Acessórios', organizationId },
  ];

  for (const product of products) {
    // Check duplication by name and organization
    const exists = await prisma.product.findFirst({ where: { name: product.name, organizationId } });
    if (!exists) {
      await prisma.product.create({ data: product });
    }
  }
  
  console.log(`  - ${products.length} products processed.`);
}
