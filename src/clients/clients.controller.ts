import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Req,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { ClientsService } from './clients.service';
import { CreateClientDto } from './dto/create-client.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('clients')
@UseGuards(JwtAuthGuard)
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) {}

  @Post()
  create(@Req() req, @Body() createClientDto: CreateClientDto) {
    return this.clientsService.create(createClientDto, req.user.activeOrganizationId);
  }

  @Get()
  findAll(@Req() req) {
    return this.clientsService.findAll(req.user.activeOrganizationId);
  }

  @Get(':id')
  findOne(@Req() req, @Param('id') id: string) {
    return this.clientsService.findOne(id, req.user.activeOrganizationId);
  }

  @Patch(':id')
  update(@Req() req, @Param('id') id: string, @Body() body: any) {
    return this.clientsService.update(id, body, req.user.activeOrganizationId);
  }

  @Delete(':id')
  remove(@Req() req, @Param('id') id: string) {
    return this.clientsService.remove(id, req.user.activeOrganizationId);
  }
}
