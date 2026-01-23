import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, OrganizationMemberRole } from '@prisma/client';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { AddMemberDto } from './dto/add-member.dto';
import { UpdateMemberRoleDto } from './dto/update-member-role.dto';

import { UsersService } from '../users/users.service';

@Injectable()
export class OrganizationService {
  constructor(
    private prisma: PrismaService,
    private usersService: UsersService,
  ) {}

  // ============= ORGANIZATION CRUD =============

  async create(
    createOrgDto: CreateOrganizationDto,
    ownerUserId?: string,
  ) {
    const organization = await this.prisma.organization.create({
      data: {
        name: createOrgDto.name,
        type: createOrgDto.type,
        cnpj: createOrgDto.cnpj,
        isPhysicalLocation:
          createOrgDto.isPhysicalLocation !== undefined
            ? createOrgDto.isPhysicalLocation
            : true,
        address: createOrgDto.address,
        phone: createOrgDto.phone,
        email: createOrgDto.email,
        ownerId: ownerUserId || null,
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    // Automatically add owner as a member with 'owner' role if owner exists
    if (ownerUserId) {
      await this.prisma.organizationMember.create({
        data: {
          organizationId: organization.id,
          userId: ownerUserId,
          role: OrganizationMemberRole.OWNER,
        },
      });
    }

    return organization;
  }

  async findAll() {
    return await this.prisma.organization.findMany({
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        /* vets relation invalid directly
        vets: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        */
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findById(organizationId: string) {
    const organization = await this.prisma.organization.findUnique({
      where: { id: organizationId },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                // role: true, // Removed
              },
            },
          },
        },
        /* vets relation invalid directly
        vets: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        */
      },
    });

    if (!organization) {
      throw new NotFoundException(
        `Organization with id ${organizationId} not found`,
      );
    }

    return organization;
  }

  async update(
    organizationId: string,
    updateOrgDto: UpdateOrganizationDto,
  ) {
    const organization = await this.findById(organizationId);

    const updatedOrg = await this.prisma.organization.update({
      where: { id: organizationId },
      data: {
        name: updateOrgDto.name || organization.name,
        type: updateOrgDto.type || organization.type,
        cnpj: updateOrgDto.cnpj || organization.cnpj,
        isPhysicalLocation:
          updateOrgDto.isPhysicalLocation !== undefined
            ? updateOrgDto.isPhysicalLocation
            : organization.isPhysicalLocation,
        address: updateOrgDto.address || organization.address,
        phone: updateOrgDto.phone || organization.phone,
        email: updateOrgDto.email || organization.email,
        ownerId: updateOrgDto.ownerId !== undefined ? updateOrgDto.ownerId : organization.ownerId,
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    // If owner is being updated, ensure the new owner is a member with 'owner' role
    if (updateOrgDto.ownerId) {
      await this.prisma.organizationMember.upsert({
        where: {
          organizationId_userId: {
            organizationId,
            userId: updateOrgDto.ownerId,
          },
        },
        create: {
          organizationId,
          userId: updateOrgDto.ownerId,
          role: OrganizationMemberRole.OWNER,
        },
        update: {
          role: OrganizationMemberRole.OWNER,
        },
      });
    }

    return updatedOrg;
  }

  async delete(organizationId: string) {
    const organization = await this.findById(organizationId);

    // Delete all members first
    await this.prisma.organizationMember.deleteMany({
      where: { organizationId },
    });

    // Vets are members, handled above.
    // Vet profile does not have organizationId.
    /*
    await this.prisma.vet.updateMany({
      where: { organizationId },
      data: { organizationId: null },
    });
    */

    // Delete organization
    return await this.prisma.organization.delete({
      where: { id: organizationId },
    });
  }

  // ============= MEMBER MANAGEMENT =============

  async getMembers(organizationId: string) {
    await this.findById(organizationId); // Verify org exists

    return await this.prisma.organizationMember.findMany({
      where: { organizationId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            // role: true, // Removed
          },
        },
      },
      orderBy: {
        joinedAt: 'desc',
      },
    });
  }

  async addMember(
    organizationId: string,
    addMemberDto: AddMemberDto,
  ) {
    const organization = await this.findById(organizationId);
    
    let targetUserId = addMemberDto.userId;

    // Logic: Find or Create User if userId not provided
    if (!targetUserId && addMemberDto.email) {
        const existingUser = await this.usersService.findByEmail(addMemberDto.email);
        
        if (existingUser) {
            targetUserId = existingUser.id;
        } else {
            // Validate required fields for creation
            if (!addMemberDto.name || !addMemberDto.password) {
                throw new BadRequestException('Name and Password are required to create a new user');
            }
            
            const newUser = await this.usersService.create({
                name: addMemberDto.name,
                email: addMemberDto.email,
                password: addMemberDto.password,
            });
            targetUserId = newUser.id;
        }
    }

    if (!targetUserId) {
        throw new BadRequestException('UserId or Email is required');
    }

    // Verify user exists (redundant if we just created/found, but safe for direct ID flow)
    const user = await this.prisma.user.findUnique({
      where: { id: targetUserId },
    });

    if (!user) {
      throw new NotFoundException(`User with id ${targetUserId} not found`);
    }

    // Check if user is already a member
    const existingMember = await this.prisma.organizationMember.findUnique({
      where: {
        organizationId_userId: {
          organizationId,
          userId: targetUserId,
        },
      },
    });

    if (existingMember) {
      throw new BadRequestException(
        'User is already a member of this organization',
      );
    }

    return await this.prisma.organizationMember.create({
      data: {
        organizationId,
        userId: targetUserId,
        role: addMemberDto.role as unknown as OrganizationMemberRole,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  async removeMember(organizationId: string, userId: string) {
    const organization = await this.findById(organizationId);

    const member = await this.prisma.organizationMember.findUnique({
      where: {
        organizationId_userId: {
          organizationId,
          userId,
        },
      },
    });

    if (!member) {
      throw new NotFoundException('Member not found in this organization');
    }

    // Prevent removing the owner
    if (member.role === OrganizationMemberRole.OWNER && organization.ownerId === userId) {
      throw new BadRequestException(
        'Cannot remove the owner from the organization',
      );
    }

    return await this.prisma.organizationMember.delete({
      where: {
        organizationId_userId: {
          organizationId,
          userId,
        },
      },
    });
  }

  async updateMemberRole(
    organizationId: string,
    userId: string,
    updateRoleDto: UpdateMemberRoleDto,
  ) {
    const organization = await this.findById(organizationId);

    const member = await this.prisma.organizationMember.findUnique({
      where: {
        organizationId_userId: {
          organizationId,
          userId,
        },
      },
    });

    if (!member) {
      throw new NotFoundException('Member not found in this organization');
    }

    // Prevent downgrading the owner
    if (member.role === OrganizationMemberRole.OWNER && updateRoleDto.role !== (OrganizationMemberRole.OWNER as unknown as any)) {
      throw new BadRequestException(
        'Cannot change the role of the organization owner',
      );
    }

    // Prevent promoting to OWNER via this endpoint (Must change Organization Owner via Org Update)
    if (updateRoleDto.role === (OrganizationMemberRole.OWNER as unknown as any)) {
        throw new BadRequestException(
            'Cannot promote a member to OWNER via role update. Use Organization settings to transfer ownership.',
        );
    }

    return await this.prisma.organizationMember.update({
      where: {
        organizationId_userId: {
          organizationId,
          userId,
        },
      },
      data: {
        role: updateRoleDto.role as unknown as OrganizationMemberRole,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  // ============= VET MANAGEMENT =============

  async getVets(organizationId: string) {
    await this.findById(organizationId); // Verify org exists

    await this.findById(organizationId); // Verify org exists

    return await this.prisma.organizationMember.findMany({
      where: { organizationId, role: OrganizationMemberRole.VET },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  // ============= UTILITY METHODS =============

  async checkOwnership(organizationId: string, userId: string, isRoot?: boolean) {
    if (isRoot) {
      return await this.findById(organizationId);
    }

    const organization = await this.findById(organizationId);

    if (organization.ownerId !== userId) {
      throw new ForbiddenException(
        'You do not have permission to manage this organization',
      );
    }

    return organization;
  }

  async checkMembership(organizationId: string, userId: string, isRoot?: boolean) {
    if (isRoot) {
       // ROOT simulates being an owner for permission checks.
       return {
         id: 'root-bypass',
         organizationId,
         userId,
         role: 'OWNER',
         joinedAt: new Date(),
         createdAt: new Date(),
         updatedAt: new Date(),
       } as any;
    }

    const member = await this.prisma.organizationMember.findUnique({
      where: {
        organizationId_userId: {
          organizationId,
          userId,
        },
      },
    });

    if (!member) {
      throw new ForbiddenException(
        'You are not a member of this organization',
      );
    }

    return member;
  }

  async getUserOrganizations(userId: string) {
    const members = await this.prisma.organizationMember.findMany({
      where: { userId },
      include: {
        organization: {
          include: {
            owner: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    return members.map((member) => member.organization);
  }

  async getUserMemberships(userId: string) {
    const members = await this.prisma.organizationMember.findMany({
      where: { userId, status: 'ACTIVE' },
      include: {
        organization: {
          select: {
            id: true,
            name: true,
            type: true,
            cnpj: true,
            isPhysicalLocation: true,
            address: true,
            phone: true,
            owner: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
      orderBy: {
        joinedAt: 'desc',
      },
    });

    return members.map((member) => ({
      organizationId: member.organizationId,
      role: member.role,
      status: member.status,
      organization: member.organization,
    }));
  }
}
