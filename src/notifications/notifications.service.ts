import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateNotificationDto } from './dto/create-notification.dto';

@Injectable()
export class NotificationsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateNotificationDto) {
    return this.prisma.notification.create({
      data: {
        user: { connect: { id: dto.userId } },
        appointment: dto.appointmentId
          ? { connect: { id: dto.appointmentId } }
          : undefined,
        type: dto.type,
        data: (dto.data ?? {}) as Prisma.InputJsonValue,
      },
    });
  }

  async findAllByUser(userId: string) {
    return this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async markRead(id: string, userId: string) {
    const note = await this.prisma.notification.findUnique({ where: { id } });
    if (!note) throw new NotFoundException('Notification not found');
    if (note.userId !== userId)
      throw new NotFoundException('Notification not found for user');

    return this.prisma.notification.update({
      where: { id },
      data: { read: true },
    });
  }
}
