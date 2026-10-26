import {
  Controller,
  Get,
  UseGuards,
  Request,
  Patch,
  Param,
  Body,
  Post,
} from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RoleGuard } from '../auth/guards/role.guard';
import { Role } from '../auth/decorators/role.decorator';
import { CreateNotificationDto } from './dto/create-notification.dto';

@Controller('notifications')
@UseGuards(JwtAuthGuard, RoleGuard)
export class NotificationsController {
  constructor(private notificationsService: NotificationsService) {}

  @Get()
  async list(@Request() req) {
    const userId = req.user?.id;
    return this.notificationsService.findAllByUser(userId);
  }

  @Patch(':id/read')
  async markRead(@Param('id') id: string, @Request() req) {
    const userId = req.user?.id;
    return this.notificationsService.markRead(id, userId);
  }

  // Internal creation endpoint restricted to staff
  @Role('VET', 'ADMIN', 'ROOT')
  @Post()
  async create(@Body() body: CreateNotificationDto) {
    return this.notificationsService.create(body);
  }
}
