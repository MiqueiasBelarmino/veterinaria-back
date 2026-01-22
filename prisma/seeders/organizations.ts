import { PrismaClient, OrganizationType, OrganizationMemberRole, OrganizationMemberStatus } from '@prisma/client';

export async function seedOrganizations(prisma: PrismaClient, users: any) {
  console.log('Seeding Organizations...');

  const { vetUser, adminUser, staffUser, vetWorkerUser, clientUser } = users;

  if (!vetUser) {
    console.warn('  - Vet user not found, skipping Organization creation.');
    return;
  }

  // 2. Create Main Organization
  const orgName = 'Clínica Veterinária Central';
  const orgSlug = 'clinica-central';

  let organization = await prisma.organization.findFirst({
    where: {
      OR: [
          { slug: orgSlug },
          { name: orgName } // Fallback
      ]
    },
  });

  if (!organization) {
    organization = await prisma.organization.create({
      data: {
        name: orgName,
        slug: orgSlug,
        type: OrganizationType.clinic,
        cnpj: '12.345.678/0001-99',
        phone: '(11) 3333-4444',
        address: 'Av. Principal, 500',
        isPhysicalLocation: true,
        ownerId: vetUser.id,
        members: {
            create: [
                // Owner
                {
                    userId: vetUser.id,
                    role: OrganizationMemberRole.OWNER,
                    status: OrganizationMemberStatus.ACTIVE
                },
                // Admin
                {
                    userId: adminUser.id,
                    role: OrganizationMemberRole.ADMIN,
                    status: OrganizationMemberStatus.ACTIVE
                },
                // Staff
                {
                    userId: staffUser.id,
                    role: OrganizationMemberRole.STAFF,
                    status: OrganizationMemberStatus.ACTIVE
                },
                // Vet Worker
                {
                    userId: vetWorkerUser.id,
                    role: OrganizationMemberRole.VET,
                    status: OrganizationMemberStatus.ACTIVE
                },
                // Client Portal Access
                {
                    userId: clientUser.id,
                    role: OrganizationMemberRole.CLIENT,
                    status: OrganizationMemberStatus.ACTIVE
                }
            ]
        }
      },
    });
    console.log('  - Organization created with all members:', organization.name);
  } else {
    // Upsert Memberships
    const rolesToAdd = [
        { user: vetUser, role: OrganizationMemberRole.OWNER },
        { user: adminUser, role: OrganizationMemberRole.ADMIN },
        { user: staffUser, role: OrganizationMemberRole.STAFF },
        { user: vetWorkerUser, role: OrganizationMemberRole.VET },
        { user: clientUser, role: OrganizationMemberRole.CLIENT },
    ];

    for (const { user, role } of rolesToAdd) {
        const membership = await prisma.organizationMember.findUnique({
            where: {
                organizationId_userId: {
                    organizationId: organization.id,
                    userId: user.id
                }
            }
        });

        if (!membership) {
            await prisma.organizationMember.create({
                data: {
                    organizationId: organization.id,
                    userId: user.id,
                    role: role,
                    status: OrganizationMemberStatus.ACTIVE
                }
            });
            console.log(`  - Membership for ${role} added.`);
        }
    }
  }

  // 3. Create Client linked to Client User
  if (clientUser) {
      const client = await prisma.client.upsert({
          where: { 
              // unique constraint usually is email? or just no unique on client email per global?
              // Client table doesn't have unique email constraint in schema shown earlier, but usually good practice.
              // We'll search by name or create. Ideally search by userId if linked.
              // The schema has OrganizationId + UserId unique? No.
              // Let's check schema again. Client has userId.
              // Wait, schema check: Client has userId? Yes.
               // @@unique([organizationId, userId])? No, just index.
               // But usually one client record per user per org.
               // ID is uuid.
               // We will use findFirst.
               id: 'dummy-uuid-forcing-create-if-not-found' // hacky, better findFirst
          },
          update: {},
          create: {
            organizationId: organization.id,
            userId: clientUser.id,
            name: clientUser.name,
            email: clientUser.email,
            phone: '(11) 99999-8888',
            address: 'Rua do Cliente, 100'
          }
      }).catch(async () => {
          // Fallback if upsert fails on ID or checking existence
          const existing = await prisma.client.findFirst({
              where: {
                  organizationId: organization.id,
                  userId: clientUser.id
              }
          });
          
          if (!existing) {
             return await prisma.client.create({
                  data: {
                    organizationId: organization.id,
                    userId: clientUser.id,
                    name: clientUser.name,
                    email: clientUser.email,
                    phone: '(11) 99999-8888',
                    address: 'Rua do Cliente, 100'
                  }
              });
          }
          return existing;
      });
      console.log('  - Client Record created/found for:', clientUser.email);
      
      // Create a Pet for this client
        const pet = await prisma.pet.findFirst({
            where: {
                organizationId: organization.id,
                clientId: (await prisma.client.findFirst({ where: { organizationId: organization.id, userId: clientUser.id } }))?.id
            }
        });

        if (!pet) {
            const clientRecord = await prisma.client.findFirst({ where: { organizationId: organization.id, userId: clientUser.id } });
            if (clientRecord) {
                 await prisma.pet.create({
                    data: {
                        organizationId: organization.id,
                        clientId: clientRecord.id,
                        name: 'Rex',
                        species: 'Cachorro',
                        breed: 'Vira-lata',
                        weight: 15.5,
                        birthDate: new Date('2020-01-01'),
                        sex: 'M',
                        isNeutered: true
                    }
                });
                console.log('  - Pet Rex created for client.');
            }
        }
  }

  return organization;
}
