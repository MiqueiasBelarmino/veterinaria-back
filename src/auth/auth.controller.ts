import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  Request,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  login(@Body() body: { email: string; password: string }) {
    return this.authService.login(body.email, body.password);
  }

  @UseGuards(JwtAuthGuard)
  @Post('select-organization')
  selectOrganization(@Request() req, @Body() body: { organizationId: string }) {
    return this.authService.selectOrganization(req.user.id, body.organizationId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('select-org')
  selectOrgLegacy(@Request() req, @Body() body: { organizationId: string }) {
    return this.authService.selectOrganization(req.user.id, body.organizationId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('root/assume')
  assumeOrganization(@Request() req, @Body() body: { organizationId: string }) {
    return this.authService.assumeOrganization(req.user.id, body.organizationId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('root/revert')
  revertToSystem(@Request() req) {
    return this.authService.revertToSystem(req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  getMe(@Request() req) {
    return this.authService.getMe(req.user);
  }
}
