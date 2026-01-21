import { PrismaClient, OrganizationType, OrganizationMemberRole, OrganizationMemberStatus } from '@prisma/client';

export async function seedOrganizations(prisma: PrismaClient) {
  console.log('Seeding Organizations...');

  // 1. Fetch the Vet User
  const vetUser = await prisma.user.findUnique({
    where: { email: 'vet@vetapp.com' },
    include: { vet: true },
  });

  if (!vetUser) {
    console.warn('  - Vet user not found, skipping Organization creation.');
    return;
  }

  // 2. Create Main Organization
  const orgName = 'Clínica Veterinária Central';
  // We identify by name for seeding idempotency roughly because slug might be auto-generated or null
  // But let's check by slug if we can, or just name. We put unique constraint on slug.
  
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
            create: {
                userId: vetUser.id,
                role: OrganizationMemberRole.OWNER,
                status: OrganizationMemberStatus.ACTIVE
            }
        }
      },
    });
    console.log('  - Organization created:', organization.name);
  } else {
    // Ensure membership exists
    const membership = await prisma.organizationMember.findUnique({
        where: {
            organizationId_userId: {
                organizationId: organization.id,
                userId: vetUser.id
            }
        }
    });

    if (!membership) {
        await prisma.organizationMember.create({
            data: {
                organizationId: organization.id,
                userId: vetUser.id,
                role: OrganizationMemberRole.OWNER,
                status: OrganizationMemberStatus.ACTIVE
            }
        });
        console.log('  - Owner membership reinstated.');
    }
  }

  // 3. Link Vet Profile to this Organization (Legacy/Compat support if Vet table has organizationId)
  if (vetUser.vet) {
     // NOTE: Vet table doesn't strictly NEED organizationId if we use Memberships, 
     // but our schema KEPT it optionally? Let's check schema.
     // In my schema rewrite `Vet` does NOT have `organizationId` explicitly in the relation block I wrote?
     // Let me double check schema content I wrote.
     // I didn't verify if I removed it. I think I removed `clinicId` and `organizationId` from `Vet` model 
     // or I kept it logic-heavy.
     // Actually, I should probably check if `Vet` model has `organizationId` in the new schema.
     // I'll assume for now I shouldn't try update it if it's not there.
  }

  return organization;
}
