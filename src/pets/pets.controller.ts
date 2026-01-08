import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { PetsService } from './pets.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('pets')
@UseGuards(JwtAuthGuard)
export class PetsController {
  constructor(private readonly petsService: PetsService) {}

  @Post()
  create(@Body() body: any) {
    // Basic DTO should be improved later using Zod or ClassValidator
    return this.petsService.create(body);
  }

  @Get()
  findAll(@Request() req: any) {
    // If client, maybe filter by owning client?
    // For MVP, just list all or by query.
    // If req.user.role === 'CLIENT', user should implement filter.
    // Assuming backend logic filters, but for now generic.
    return this.petsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.petsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: any) {
    return this.petsService.update(id, body);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.petsService.remove(id);
  }
}
