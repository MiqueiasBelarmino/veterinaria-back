import { Controller, Get, UseGuards, Request, Patch, Param, Body, Post } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateNotificationDto } from './dto/create-notification.dto';

@Controller('notifications')
export class NotificationsController {
  constructor(private notificationsService: NotificationsService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  async list(@Request() req) {
    const userId = req.user?.id;
    return this.notificationsService.findAllByUser(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/read')
  async markRead(@Param('id') id: string, @Request() req) {
    const userId = req.user?.id;
    return this.notificationsService.markRead(id, userId);
  }

  // Internal creation endpoint (can be protected/limited further)
  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Body() body: CreateNotificationDto) {
    return this.notificationsService.create(body);
  }
}

