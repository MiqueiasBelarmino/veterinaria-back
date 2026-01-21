import { PrismaClient, Role } from '@prisma/client';

export async function seedClients(prisma: PrismaClient, organizationId: string) {
  console.log('Seeding Clients...');

  const user = await prisma.user.findUnique({
      where: { email: 'cliente@exemplo.com' }
  });

  if (!user) {
      console.error('Client user not found');
      return;
  }

  // Check if profile exists
  const existingClient = await prisma.client.findUnique({
      where: { userId: user.id }
  });

  if (!existingClient) {
      await prisma.client.create({
          data: {
              userId: user.id,
              name: 'João Silva',
              phone: '11999999999',
              address: 'Rua das Flores, 123',
              // Use the passed organizationId
              organizationId: organizationId,
              pets: {
                create: {
                  name: 'Rex',
                  species: 'Cachorro',
                  breed: 'Labrador',
                  weight: 25.5,
                  sex: 'Macho',
                  observations: 'Alergia a picada de abelha.',
                },
              },
          }
      });
      console.log('  - Client Profile created linked to Organization.');
  } else {
      console.log('  - Client Profile already exists.');
  }
}
