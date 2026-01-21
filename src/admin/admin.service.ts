import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  // User Management
  async getAllUsers() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getUserById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) throw new NotFoundException('Usuário não encontrado');
    return user;
  }

  async createUser(data: { name: string; email: string; password: string; role?: 'VET' | 'CLIENT' | 'ADMIN' | 'ROOT' }) {
    const existingUser = await this.prisma.user.findUnique({ where: { email: data.email } });
    if (existingUser) throw new BadRequestException('Email já cadastrado');

    const hashedPassword = await bcrypt.hash(data.password, 10);

    return this.prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: hashedPassword,
        role: data.role || 'CLIENT',
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });
  }

  async updateUserRole(userId: string, newRole: 'VET' | 'CLIENT' | 'ADMIN' | 'ROOT') {
    // Prevent downgrading ROOT users
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (user?.role === 'ROOT' && newRole !== 'ROOT') {
      throw new BadRequestException('Não é possível fazer downgrade de usuário ROOT');
    }

    return this.prisma.user.update({
      where: { id: userId },
      data: { role: newRole },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        updatedAt: true,
      },
    });
  }

  async deleteUser(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('Usuário não encontrado');
    if (user.role === 'ROOT') throw new BadRequestException('Não é possível deletar usuário ROOT');

    // Delete related data
    await this.prisma.user.delete({ where: { id: userId } });

    return { message: 'Usuário deletado com sucesso' };
  }

  async resetUserPassword(userId: string, newPassword: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('Usuário não encontrado');

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    return this.prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        updatedAt: true,
      },
    });
  }

  // Clinics Management
  async getAllClinics() {
    return this.prisma.clinic.findMany({
      select: {
        id: true,
        name: true,
        address: true,
        phone: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getClinicStats(clinicId?: string) {
    const countArgs = clinicId ? { where: { clinicId } } : undefined;

    const [vets, clients, pets] = await Promise.all([
      this.prisma.vet.count(countArgs),
      this.prisma.client.count(),
      this.prisma.pet.count(),
    ]);

    return {
      vets,
      clients,
      pets,
    };
  }

  // Dashboard Statistics
  async getDashboardStats() {
    const [totalUsers, totalVets, totalClients, totalAppointments, totalPets, usersByRole] =
      await Promise.all([
        this.prisma.user.count(),
        this.prisma.vet.count(),
        this.prisma.client.count(),
        this.prisma.appointment.count(),
        this.prisma.pet.count(),
        this.getUsersByRole(),
      ]);

    return {
      totalUsers,
      totalVets,
      totalClients,
      totalAppointments,
      totalPets,
      usersByRole,
    };
  }

  private async getUsersByRole() {
    return this.prisma.user.groupBy({
      by: ['role'],
      _count: true,
    });
  }

  // Activity Log
  async getRecentActivity(limit: number = 50) {
    const appointments = await this.prisma.appointment.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        type: true,
        status: true,
        createdAt: true,
        vet: { select: { user: { select: { name: true } } } },
      },
    });

    return appointments;
  }

  // Pets Management
  async getAllPets() {
    return this.prisma.pet.findMany({
      select: {
        id: true,
        name: true,
        species: true,
        breed: true,
        client: { select: { name: true } },
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // Appointments Management
  async getAllAppointments() {
    return this.prisma.appointment.findMany({
      select: {
        id: true,
        type: true,
        status: true,
        date: true,
        pet: { select: { name: true } },
        vet: { select: { user: { select: { name: true } } } },
        createdAt: true,
      },
      orderBy: { date: 'desc' },
    });
  }

  // System Settings
  async getSystemSettings() {
    return {
      version: '1.0.0',
      lastUpdated: new Date(),
      features: {
        appointments: true,
        prescriptions: true,
        laboratorExams: true,
        dietaryPlans: true,
        clinicalRecords: true,
        educationalMaterials: true,
      },
    };
  }
}
