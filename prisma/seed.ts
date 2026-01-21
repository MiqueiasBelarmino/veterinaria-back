import { PrismaClient } from '@prisma/client';
import { seedUsers } from './seeders/users';
import { seedOrganizations } from './seeders/organizations';
// import { seedProducts } from './seeders/products';
// import { seedPlans } from './seeders/plans';
// import { seedClients } from './seeders/clients';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seed...');

  try {
    // 1. Users
    await seedUsers(prisma);

    // 2. Organizations (Depends on Users)
    const organization = await seedOrganizations(prisma);
    
    // We will uncomment these later as we fix them one by one
    // if (organization) {
    //     // 3. Clients
    //     await seedClients(prisma, organization.id);
    //     // 4. Products
    //     await seedProducts(prisma, organization.id);
    //     // 5. Plans
    //     await seedPlans(prisma, organization.id);
    // }

    console.log('Seed completed successfully!');
  } catch (error) {
    console.error('Error during seed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
