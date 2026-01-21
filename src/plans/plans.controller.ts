import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Patch,
  Param,
  UsePipes,
  ValidationPipe,
  Req,
} from '@nestjs/common';
import { PlansService } from './plans.service';
import { CreatePlanDto } from './dto/create-plan.dto';
import { UpdatePlanDto } from './dto/update-plan.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OrgGuard } from '../auth/guards/org.guard';
import { RoleGuard } from '../auth/guards/role.guard';
import { Role } from '../auth/decorators/role.decorator';

@Controller('plans')
@UseGuards(JwtAuthGuard, OrgGuard, RoleGuard)
export class PlansController {
  constructor(private readonly plansService: PlansService) {}

  @Post()
  @UsePipes(new ValidationPipe({ transform: true }))
  @Role('VET') // Admin/Vet
  create(@Req() req, @Body() createPlanDto: CreatePlanDto) {
    return this.plansService.create(createPlanDto, req.user.organizationId);
  }

  @Get('pet/:petId')
  @Role('VET') // Owner/Vet
  findAllByPet(@Req() req, @Param('petId') petId: string) {
    return this.plansService.findAllByPet(petId, req.user.organizationId);
  }

  @Get('definitions')
  // Public to authenticated users in org? Or just VET?
  // Plans are usually sold, so VET/ADMIN sees them. Clients might see available plans?
  @Role('VET') 
  findAllDefinitions(@Req() req) {
    // If Client, we might want to allow this? For now restrict.
    return this.plansService.findAllDefinitions(req.user.organizationId);
  }

  @Get(':id')
  @Role('VET') // or Owner
  findOne(@Req() req, @Param('id') id: string) {
    return this.plansService.findOne(id, req.user.organizationId);
  }

  @Patch(':id')
  @UsePipes(new ValidationPipe({ transform: true }))
  @Role('VET')
  update(@Req() req, @Param('id') id: string, @Body() updatePlanDto: UpdatePlanDto) {
    return this.plansService.update(id, updatePlanDto, req.user.organizationId);
  }
}
