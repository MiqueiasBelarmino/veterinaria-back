import { PrismaClient, OrganizationType, OrganizationMemberRole } from '@prisma/client';

export async function seedOrganizations(prisma: PrismaClient) {
  console.log('Seeding Organizations...');

  // 1. Fetch the Vet User (owner)
  const vetUser = await prisma.user.findUnique({
    where: { email: 'vet@exemplo.com' },
    include: { vet: true },
  });

  if (!vetUser || !vetUser.vet) {
    console.warn('  - Vet user not found, skipping Organization creation.');
    return;
  }

  // 2. Create/Update Main Organization (Generic Clinic)
  // We use upsert or check existence. Since we don't have a unique key for name easily (unless schema changed),
  // we'll try to find one where valid owner is this vet.
  
  let organization = await prisma.organization.findFirst({
    where: {
      ownerId: vetUser.id,
      name: 'Clínica Veterinária Central',
    },
  });

  if (!organization) {
    organization = await prisma.organization.create({
      data: {
        name: 'Clínica Veterinária Central',
        type: OrganizationType.clinic,
        cnpj: '12.345.678/0001-99',
        phone: '(11) 3333-4444',
        address: 'Av. Principal, 500',
        isPhysicalLocation: true,
        ownerId: vetUser.id,
        // Add owner as a member automatically? The schema relations allow separate handling.
        members: {
            create: {
                userId: vetUser.id,
                role: OrganizationMemberRole.owner
            }
        }
      },
    });
    console.log('  - Organization created:', organization.name);
  } else {
    console.log('  - Organization already exists:', organization.name);
  }

  // 3. Link Vet Profile to this Organization
  // Currently Vet profile has organizationId.
  if (vetUser.vet.organizationId !== organization.id) {
    await prisma.vet.update({
      where: { id: vetUser.vet.id },
      data: { organizationId: organization.id },
    });
    console.log('  - Vet linked to organization.');
  }

  // 4. Create a Practice (Consultório) Organization (Optional example)
  let practice = await prisma.organization.findFirst({
      where: { name: 'Consultório Dr. Pet' }
  });

  if (!practice) {
      practice = await prisma.organization.create({
          data: {
              name: 'Consultório Dr. Pet',
              type: OrganizationType.practice,
              isPhysicalLocation: true,
              address: 'Rua Pequena, 10',
              // We could assign another user or leave without owner for now (if optional)
              // Schema says ownerId is optional.
          }
      });
      console.log('  - Practice Organization created:', practice.name);
  }

  return organization;
}
