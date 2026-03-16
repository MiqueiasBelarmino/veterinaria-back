import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private prisma: PrismaService,
  ) {}

  async validateUser(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);

    if (!user || !user.password || !(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    return user;
  }

  async login(email: string, password: string) {
    const user = await this.validateUser(email, password);

    let clientId: string | undefined;
    if (user.role === 'CLIENT') {
      const client = await this.prisma.client.findUnique({
        where: { userId: user.id },
      });
      clientId = client?.id;
    }

    const payload = {
      sub: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      clientId,
    };
    const token = this.jwtService.sign(payload);

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        clientId,
      },
    };
  }

  async register(dto: RegisterDto) {
    const existingUser = await this.usersService.findByEmail(dto.email);
    if (existingUser) {
      throw new ConflictException('E-mail já está em uso');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const { user, client } = await this.prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          email: dto.email,
          name: dto.name,
          password: hashedPassword,
          role: 'CLIENT',
        },
      });

      const newClient = await tx.client.create({
        data: {
          name: dto.name,
          email: dto.email,
          phone: dto.phone,
          userId: newUser.id,
        },
      });

      return { user: newUser, client: newClient };
    });

    const payload = {
      sub: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      clientId: client.id,
    };
    const token = this.jwtService.sign(payload);

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        clientId: client.id,
      },
    };
  }
}
