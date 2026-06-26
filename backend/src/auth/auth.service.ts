import { Injectable, ConflictException, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {
    const { username, password, role, teacherCode } = registerDto;

    const normalizedRole = role.toLowerCase();

    if (normalizedRole === 'teacher') {
      const expectedCode = process.env.TEACHER_SIGNUP_CODE || 'DefaultSecuredCode123';
      if (teacherCode !== expectedCode) {
        throw new UnauthorizedException('Invalid or missing teacher verification code');
      }
    }

    const existingUser = await this.prisma.user.findUnique({
      where: { username },
    });

    if (existingUser) {
      throw new ConflictException('Username is already taken');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await this.prisma.user.create({
      data: {
        username,
        password: hashedPassword,
        role: normalizedRole,
      },
      select: {
        id: true,
        username: true,
        role: true,
      },
    });

    const token = this.generateToken(user);
    return { user, token };
  }

  async login(loginDto: LoginDto) {
    const { username, password } = loginDto;

    const user = await this.prisma.user.findUnique({
      where: { username },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const userPayload = {
      id: user.id,
      username: user.username,
      role: user.role,
    };

    const token = this.generateToken(userPayload);
    return { user: userPayload, token };
  }

  private generateToken(user: { id: number; username: string; role: string }) {
    const payload = { username: user.username, sub: user.id, role: user.role };
    return this.jwtService.sign(payload);
  }
}
