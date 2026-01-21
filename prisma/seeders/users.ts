import { PrismaClient, GlobalRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';

export async function seedUsers(prisma: PrismaClient) {
  console.log('Seeding Users...');
  const hashedPassword = await bcrypt.hash('senha123', 10);

  // 1. Create ROOT Admin User
  const rootUser = await prisma.user.upsert({
    where: { email: 'root@vetapp.com' },
    update: {},
    create: {
      email: 'root@vetapp.com',
      name: 'Admin ROOT',
      password: hashedPassword,
      isSuperAdmin: true,
      globalRole: GlobalRole.ROOT,
    },
  });
  console.log('  - ROOT User created/found:', rootUser.email);

  // 2. Create Vet User (Owner of the default clinic)
  const vetUser = await prisma.user.upsert({
    where: { email: 'vet@vetapp.com' },
    update: {},
    create: {
      email: 'vet@vetapp.com',
      name: 'Dra. Ana Veterinária',
      password: hashedPassword,
      isSuperAdmin: false,
      globalRole: GlobalRole.USER,
      // We will create the Vet Profile later or here if independent
       vet: {
         create: {
           crmv: '12345-SP',
           specialty: 'Clínica Geral e Cirurgia',
         },
       },
    },
  });
  console.log('  - Vet User created/found:', vetUser.email);

  return { 
    rootUser, 
    vetUser
  };
}
