import { PrismaClient, OrganizationMemberRole, OrganizationType } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // 1. Clean Database
  console.log('🧹 Cleaning database...');
  try {
    await prisma.organizationMember.deleteMany();
    await prisma.organization.deleteMany();
    await prisma.user.deleteMany();
  } catch (e) {
    console.warn('Clean failed (ignoring):', e);
  }

  // 2. Create Root User
  const passwordHash = await bcrypt.hash('123456', 10);
  
  const rootUser = await prisma.user.upsert({
    where: { email: 'root@system.com' },
    update: {},
    create: {
      email: 'root@system.com',
      name: 'Super Root',
      password: passwordHash,
      isRoot: true,
    }
  });
  console.log('✅ Root User: root@system.com');

  // 3. Create Organization "Clinic Alpha"
  const clinicA = await prisma.organization.upsert({
    where: { slug: 'clinic-alpha' },
    update: {},
    create: {
      name: 'Clínica Veterinária Alpha',
      slug: 'clinic-alpha',
      type: OrganizationType.clinic,
      cnpj: '12.345.678/0001-90',
      address: 'Rua das Flores, 123',
    }
  });
  console.log(`✅ Organization: ${clinicA.name}`);

  // 4. Create Owner User
  const ownerUser = await prisma.user.upsert({
    where: { email: 'owner@alpha.com' },
    update: {},
    create: {
      email: 'owner@alpha.com',
      name: 'Owner',
      password: passwordHash,
    }
  });

  // 5. Link Owner to Clinic A
  await prisma.organizationMember.upsert({
    where: {
        organizationId_userId: {
            organizationId: clinicA.id,
            userId: ownerUser.id
        }
    },
    update: {},
    create: {
      userId: ownerUser.id,
      organizationId: clinicA.id,
      role: OrganizationMemberRole.OWNER,
      status: 'ACTIVE'
    }
  });
  console.log('✅ Owner Linked');

  // 6. Create Vet User
  const vetUser = await prisma.user.upsert({
    where: { email: 'vet@alpha.com' },
    update: {},
    create: {
      email: 'vet@alpha.com',
      name: 'Vet',
      password: passwordHash,
    }
  });

  // 7. Link Vet to Clinic A
  await prisma.organizationMember.upsert({
    where: {
        organizationId_userId: {
            organizationId: clinicA.id,
            userId: vetUser.id
        }
    },
    update: {},
    create: {
      userId: vetUser.id,
      organizationId: clinicA.id,
      role: OrganizationMemberRole.VET,
      status: 'ACTIVE'
    }
  });
  console.log('✅ Vet Linked');

  // 8. Create Admin User
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@alpha.com' },
    update: {},
    create: {
      email: 'admin@alpha.com',
      name: 'Admin',
      password: passwordHash,
    }
  });

  // 9. Link Admin to Clinic A
  await prisma.organizationMember.upsert({
    where: {
        organizationId_userId: {
            organizationId: clinicA.id,
            userId: adminUser.id
        }
    },
    update: {},
    create: {
      userId: adminUser.id,
      organizationId: clinicA.id,
      role: OrganizationMemberRole.ADMIN,
      status: 'ACTIVE'
    }
  });
  console.log('✅ Admin Linked');

  // 10. Create Staff User
  const staffUser = await prisma.user.upsert({
    where: { email: 'staff@alpha.com' },
    update: {},
    create: {
      email: 'staff@alpha.com',
      name: 'Assistente Staff',
      password: passwordHash,
    }
  });

  // 11. Link Staff to Clinic A
  await prisma.organizationMember.upsert({
    where: {
        organizationId_userId: {
            organizationId: clinicA.id,
            userId: staffUser.id
        }
    },
    update: {},
    create: {
      userId: staffUser.id,
      organizationId: clinicA.id,
      role: OrganizationMemberRole.STAFF,
      status: 'ACTIVE'
    }
  });
  console.log('✅ Staff Linked');

  // 12. Create Client User
  const clientUser = await prisma.user.upsert({
    where: { email: 'client@alpha.com' },
    update: {},
    create: {
      email: 'client@alpha.com',
      name: 'Cliente Exemplo',
      password: passwordHash,
    }
  });

  // 13. Link Client to Clinic A (as Member? Or just Client entity?)
  // Schema says OrganizationMemberRole includes CLIENT. 
  // If they login to the portal, they need to be an OrganizationMember with role CLIENT.
  await prisma.organizationMember.upsert({
    where: {
        organizationId_userId: {
            organizationId: clinicA.id,
            userId: clientUser.id
        }
    },
    update: {},
    create: {
      userId: clientUser.id,
      organizationId: clinicA.id,
      role: OrganizationMemberRole.CLIENT,
      status: 'ACTIVE'
    }
  });
  console.log('✅ Client Linked');


}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
