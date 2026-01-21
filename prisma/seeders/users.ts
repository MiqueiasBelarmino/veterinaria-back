import { PrismaClient, Role } from '@prisma/client';
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
      role: Role.ROOT,
    },
  });
  console.log('  - ROOT User created/found:', rootUser.email);

  // // 2. Create Vet User
  // // Note: We don't link to Organization here yet, usually handled in organization seeder 
  // // or we verify if it exists first. For now just create the User + Vet profile.
  // const vetUser = await prisma.user.upsert({
  //   where: { email: 'vet@vetapp.com' },
  //   update: {},
  //   create: {
  //     email: 'vet@vetapp.com',
  //     name: 'Dra. Ana Veterinária',
  //     password: hashedPassword,
  //     role: Role.VET,
  //     vet: {
  //       create: {
  //         crmv: '12345-SP',
  //         specialty: 'Clínica Geral e Cirurgia',
  //       },
  //     },
  //   },
  // });
  // console.log('  - Vet User created/found:', vetUser.email);

  // // 3. Create Client User (Client Profile creation moved to seedClients)
  // const clientUser = await prisma.user.upsert({
  //   where: { email: 'cliente@vetapp.com' },
  //   update: {},
  //   create: {
  //     email: 'cliente@vetapp.com',
  //     name: 'João Silva',
  //     password: hashedPassword,
  //     role: Role.CLIENT,
  //   },
  // });
  // console.log('  - Client User created/found:', clientUser.email);

  return { 
    rootUser, 
    // vetUser, 
    // clientUser 
  };
}
