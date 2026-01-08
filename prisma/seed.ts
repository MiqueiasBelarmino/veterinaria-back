import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('senha123', 10);

  // Create Vet User
  const vetUser = await prisma.user.upsert({
    where: { email: 'vet@exemplo.com' },
    update: {},
    create: {
      email: 'vet@exemplo.com',
      name: 'Dra. Ana Veterinária',
      password: hashedPassword,
      role: 'VET',
      vet: {
        create: {
          crmv: '123456',
          specialty: 'Clínica Geral',
        },
      },
    },
  });

  // Create Client User
  const clientUser = await prisma.user.upsert({
    where: { email: 'cliente@exemplo.com' },
    update: {},
    create: {
      email: 'cliente@exemplo.com',
      name: 'João Silva',
      password: hashedPassword,
      role: 'CLIENT',
      client: {
        create: {
          name: 'João Silva',
          phone: '11999999999',
          address: 'Rua das Flores, 123',
        },
      },
    },
  });

  const client = await prisma.client.findUnique({ where: { userId: clientUser.id } });

  if (client) {
    // Create Pet
    await prisma.pet.create({
      data: {
        name: 'Rex',
        species: 'Cachorro',
        breed: 'Labrador',
        weight: 25.5,
        clientId: client.id,
        observations: 'Alergia a picada de abelha.',
      },
    });
  }

  // Create Products
  await prisma.product.createMany({
    data: [
        { name: 'Ração Adulto 10kg', price: 180.00, stock: 20, category: 'Alimentação' },
        { name: 'Shampoo Neutro 500ml', price: 35.00, stock: 15, category: 'Higiene' },
        { name: 'Vacina V10', price: 120.00, stock: 50, category: 'Medicamento' },
    ],
  });

  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
