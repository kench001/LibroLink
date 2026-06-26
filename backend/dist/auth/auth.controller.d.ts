import type { Response } from 'express';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
    private setCookie;
    register(registerDto: RegisterDto, res: Response): Promise<{
        username: string;
        role: string;
        id: number;
    }>;
    login(loginDto: LoginDto, res: Response): Promise<{
        id: number;
        username: string;
        role: string;
    }>;
    logout(res: Response): Promise<{
        message: string;
    }>;
    me(req: any): Promise<any>;
}
