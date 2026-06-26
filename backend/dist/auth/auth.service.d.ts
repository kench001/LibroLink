import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
export declare class AuthService {
    private prisma;
    private jwtService;
    constructor(prisma: PrismaService, jwtService: JwtService);
    register(registerDto: RegisterDto): Promise<{
        user: {
            username: string;
            role: string;
            id: number;
        };
        token: string;
    }>;
    login(loginDto: LoginDto): Promise<{
        user: {
            id: number;
            username: string;
            role: string;
        };
        token: string;
    }>;
    private generateToken;
}
