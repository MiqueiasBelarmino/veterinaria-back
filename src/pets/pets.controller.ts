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
} from '@nestjs/common';
import { PetsService } from './pets.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OwnershipGuard } from '../auth/guards/ownership.guard';
import { CheckOwnership } from '../auth/decorators/check-ownership.decorator';
import { CreatePetDto } from './dto/create-pet.dto';
import { UpdatePetDto } from './dto/update-pet.dto';
import { ClientsService } from '../clients/clients.service';
import { OrgGuard } from '../auth/guards/org.guard';
import { RoleGuard } from '../auth/guards/role.guard';
import { Role } from '../auth/decorators/role.decorator';

@Controller('pets')
@UseGuards(JwtAuthGuard, OrgGuard, RoleGuard)
export class PetsController {
  constructor(
    private readonly petsService: PetsService,
    private readonly clientsService: ClientsService,
  ) {}

  @Post()
  @UsePipes(new ValidationPipe({ transform: true }))
  @Role('VET') // Or STAFF/ADMIN
  create(@Request() req, @Body() createPetDto: CreatePetDto) {
    return this.petsService.create(createPetDto, req.user.organizationId);
  }

  @Get()
  @Role('VET') // Check if CLIENT access is allowed here? Yes, handled below.
  async findAll(@Request() req: any) {
    const user = req.user;

    // Provide CLIENT access logic (if token has CLIENT role)
    if (user.role === 'CLIENT') {
       // We need to find the specific CLIENT record for this User in this Org
       const client = await this.clientsService.findByUserAndOrg(user.id, user.organizationId);
       if (!client) return [];
       return this.petsService.findByClient(client.id);
    }
    
    // Default VET/ADMIN access
    return this.petsService.findAll(user.organizationId);
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
