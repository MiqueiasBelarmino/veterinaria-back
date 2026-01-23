import { Controller, Get, Post, Body, Param, UseGuards, Put, Delete } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/role.guard';
import { Role } from '../auth/decorators/role.decorator';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard) // Apply to all endpoints
@Role('ROOT') // Require ROOT for all endpoints by default
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  create(@Body() body: { name: string; email: string; password: string; isRoot?: boolean }) {
    return this.usersService.create(body);
  }

  @Get()
  async findAll() {
    const users = await this.usersService.findAll();
    return users.map(user => ({
      ...user,
      role: user.isRoot ? 'ROOT' : 'CLIENT' // Defaulting to CLIENT if not ROOT for general list
    }));
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Put(':id/root')
  updateIsRoot(@Param('id') id: string, @Body() body: { isRoot: boolean }) {
    return this.usersService.updateIsRoot(id, body.isRoot);
  }

  @Put(':id/password')
  updatePassword(@Param('id') id: string, @Body() body: { password: string }) {
    return this.usersService.updatePassword(id, body.password);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}
