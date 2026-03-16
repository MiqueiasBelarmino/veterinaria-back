import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  UsePipes,
  ValidationPipe,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PetsService } from './pets.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OwnershipGuard } from '../auth/guards/ownership.guard';
import { CheckOwnership } from '../auth/decorators/check-ownership.decorator';
import { CreatePetDto } from './dto/create-pet.dto';
import { UpdatePetDto } from './dto/update-pet.dto';
import { ClientsService } from '../clients/clients.service';

@Controller('pets')
@UseGuards(JwtAuthGuard, OwnershipGuard)
export class PetsController {
  constructor(
    private readonly petsService: PetsService,
    private readonly clientsService: ClientsService,
  ) {}

  @Post()
  @UsePipes(new ValidationPipe({ transform: true }))
  create(@Body() createPetDto: CreatePetDto, @Request() req: any) {
    const user = req.user;

    if (user.role === 'CLIENT') {
      if (!user.clientId) {
        throw new ForbiddenException(
          'Perfil de cliente não vinculado ao usuário.',
        );
      }
      // Force the pet to be associated with the authenticated client
      createPetDto.clientId = user.clientId;
    } else if (!createPetDto.clientId) {
      throw new BadRequestException('O ID do cliente é obrigatório.');
    }

    return this.petsService.create(createPetDto);
  }

  @Get()
  async findAll(@Request() req: any) {
    const user = req.user;

    if (user.role === 'CLIENT') {
      const client = await this.clientsService.findByUserId(user.id);
      if (!client) return [];
      return this.petsService.findByClient(client.id);
    }

    return this.petsService.findAll();
  }

  @Get(':id')
  @CheckOwnership({ paramName: 'id', resourceType: 'pet' })
  findOne(@Param('id') id: string) {
    return this.petsService.findOne(id);
  }

  @Patch(':id')
  @CheckOwnership({ paramName: 'id', resourceType: 'pet' })
  @UsePipes(new ValidationPipe({ transform: true }))
  update(@Param('id') id: string, @Body() updatePetDto: UpdatePetDto) {
    return this.petsService.update(id, updatePetDto);
  }

  @Delete(':id')
  @CheckOwnership({ paramName: 'id', resourceType: 'pet' })
  remove(@Param('id') id: string) {
    return this.petsService.remove(id);
  }
}
