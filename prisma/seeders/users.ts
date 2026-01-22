import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

export async function seedUsers(prisma: PrismaClient) {
  console.log('Seeding Users...');
  const hashedPassword = await bcrypt.hash('password123', 10);

  // 1. Create ROOT Admin User
  const rootUser = await prisma.user.upsert({
    where: { email: 'root@vetapp.com' },
    update: {},
    create: {
      email: 'root@vetapp.com',
      name: 'Admin ROOT',
      password: hashedPassword,
      isRoot: true,
    },
  });
  console.log('  - ROOT User created/found:', rootUser.email);

  // 2. Create Vet Owner User (Owner of the default clinic)
  const vetUser = await prisma.user.upsert({
    where: { email: 'vet@vetapp.com' },
    update: {},
    create: {
      email: 'vet@vetapp.com',
      name: 'Dra. Ana Veterinária (Owner)',
      password: hashedPassword,
      isRoot: false,
      vet: {
        create: {
          crmv: '12345-SP',
          specialty: 'Clínica Geral e Cirurgia',
        },
      },
    },
  });
  console.log('  - Vet Owner User created/found:', vetUser.email);

  // 3. Create Org Admin User
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@vetapp.com' },
    update: {},
    create: {
      email: 'admin@vetapp.com',
      name: 'Admin da Clínica',
      password: hashedPassword,
      isRoot: false,
    },
  });
  console.log('  - Admin User created/found:', adminUser.email);

  // 4. Create Staff User
  const staffUser = await prisma.user.upsert({
    where: { email: 'staff@vetapp.com' },
    update: {},
    create: {
      email: 'staff@vetapp.com',
      name: 'Recepcionista Staff',
      password: hashedPassword,
      isRoot: false,
    },
  });
  console.log('  - Staff User created/found:', staffUser.email);

  // 5. Create Vet Worker User (Employee)
  const vetWorkerUser = await prisma.user.upsert({
    where: { email: 'vet_worker@vetapp.com' },
    update: {},
    create: {
      email: 'vet_worker@vetapp.com',
      name: 'Dr. João Veterinário (Employee)',
      password: hashedPassword,
      isRoot: false,
      vet: {
        create: {
          crmv: '67890-SP',
          specialty: 'Dermatologia',
        },
      },
    },
  });
  console.log('  - Vet Worker User created/found:', vetWorkerUser.email);

  // 6. Create Client User
  const clientUser = await prisma.user.upsert({
    where: { email: 'client@vetapp.com' },
    update: {},
    create: {
      email: 'client@vetapp.com',
      name: 'Carlos Cliente',
      password: hashedPassword,
      isRoot: false,
    },
  });
  console.log('  - Client User created/found:', clientUser.email);

  return { 
    rootUser, 
    vetUser,
    adminUser,
    staffUser,
    vetWorkerUser,
    clientUser
  };
}
