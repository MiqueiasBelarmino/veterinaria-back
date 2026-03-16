import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from './notifications.service';

@Injectable()
export class NotificationsScheduler {
  private readonly logger = new Logger(NotificationsScheduler.name);

  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
  ) {}

  // Runs every minute and schedules reminders defined in REMINDER_HOURS (comma separated, e.g. "48,24,1")
  // It avoids duplicates by checking existing notifications for the same appointment and scheduledAt
  @Cron(CronExpression.EVERY_MINUTE)
  async remindUpcomingAppointments() {
    const now = new Date();
    const reminderEnv = process.env.REMINDER_HOURS || '24';
    const windowMinutes = Number(process.env.REMINDER_WINDOW_MINUTES) || 1;

    const hoursList = reminderEnv
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
      .map((s) => Number(s))
      .filter((n) => !Number.isNaN(n) && n >= 0);

    if (hoursList.length === 0) {
      this.logger.warn(
        'No valid REMINDER_HOURS configured; skipping reminders',
      );
      return;
    }

    try {
      for (const hours of hoursList) {
        const targetStart = new Date(now.getTime() + hours * 60 * 60 * 1000);
        const targetEnd = new Date(
          targetStart.getTime() + windowMinutes * 60 * 1000,
        );

        const appointments = await this.prisma.appointment.findMany({
          where: {
            date: {
              gte: targetStart,
              lt: targetEnd,
            },
          },
          include: {
            pet: { include: { client: true } },
            vet: true,
          },
        });

        for (const appt of appointments) {
          const ownerUserId = appt.pet?.client?.userId;
          if (!ownerUserId) continue;

          const exists = await this.prisma.notification.findFirst({
            where: {
              appointmentId: appt.id,
              scheduledAt: targetStart,
              type: 'APPOINTMENT_REMINDER',
            },
          });
          if (exists) continue;

          await this.notificationsService.create({
            userId: ownerUserId,
            appointmentId: appt.id,
            type: 'APPOINTMENT_REMINDER',
            data: {
              message: `Lembrete: consulta em ${new Date(appt.date).toLocaleString()}`,
              reminderHours: hours,
            },
            // scheduledAt will be set by Prisma via the model field below using update; pass via data and set scheduledAt in create
            // but our DTO doesn't include scheduledAt; use prisma directly in service alternatively. For simplicity, set scheduledAt here using any type.
            scheduledAt: targetStart as any,
          } as any);
          this.logger.log(
            `Created reminder (${hours}h) for appointment ${appt.id} user ${ownerUserId}`,
          );
        }
      }
    } catch (err) {
      this.logger.error('Error running reminder job', err);
    }
  }
}
