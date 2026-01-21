import { PrismaClient } from '@prisma/client';

export async function seedPlans(prisma: PrismaClient, organizationId: string) {
  console.log('Seeding Plan Definitions...');

  const planDefinitions = [
    {
      name: 'Consulta Avulsa',
      type: 'SINGLE',
      durationInMonths: 1,
      returnsIncluded: 0,
      examReturnCounts: false,
      organizationId,
    },
    {
      name: 'Plano 2 Meses',
      type: 'MONTHLY_2',
      durationInMonths: 2,
      returnsIncluded: 1,
      examReturnCounts: false,
      organizationId,
    },
    {
      name: 'Plano 3 Meses',
      type: 'MONTHLY_3',
      durationInMonths: 3,
      returnsIncluded: 2,
      examReturnCounts: false,
      organizationId,
    },
    {
        name: 'Plano Anual',
        type: 'ANNUAL',
        durationInMonths: 12,
        returnsIncluded: 12,
        examReturnCounts: true, 
        organizationId,
    }
  ];

  for (const plan of planDefinitions) {
    const exists = await prisma.planDefinition.findFirst({ where: { name: plan.name, organizationId } });
    if (!exists) {
      await prisma.planDefinition.create({ data: plan });
    }
  }

  console.log(`  - ${planDefinitions.length} plan definitions processed.`);
}
