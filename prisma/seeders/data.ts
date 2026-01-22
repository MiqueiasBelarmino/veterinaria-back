import { PrismaClient } from '@prisma/client';

export async function seedProducts(prisma: PrismaClient, organizationId: string) {
  console.log('Seeding Products...');
  
  await prisma.product.createMany({
    data: [
        {
            organizationId,
            name: 'Consulta Geral',
            description: 'Consulta veterinária de rotina',
            price: 150.00,
            category: 'Serviço',
            stock: 999
        },
        {
            organizationId,
            name: 'Vacina V10',
            description: 'Vacina polivalente',
            price: 80.00,
            category: 'Vacina',
            stock: 50
        },
        {
            organizationId,
            name: 'Simparic 10mg',
            description: 'Antipulgas e carrapatos',
            price: 120.00,
            category: 'Medicamento',
            stock: 20
        }
    ]
  });
  console.log('  - Products created.');
}

export async function seedPlans(prisma: PrismaClient, organizationId: string) {
  console.log('Seeding Plans...');

  await prisma.planDefinition.create({
      data: {
          organizationId,
          name: 'Plano Básico',
          type: 'Mensal',
          durationInMonths: 12,
          returnsIncluded: 0,
          examReturnCounts: false,
          isActive: true
      }
  });

  await prisma.planDefinition.create({
    data: {
        organizationId,
        name: 'Plano Premium',
        type: 'Anual',
        durationInMonths: 12,
        returnsIncluded: 2, // 2 free returns per consultation? or total? logic depends on app
        examReturnCounts: true,
        isActive: true
    }
});

  console.log('  - Plans created.');
}
