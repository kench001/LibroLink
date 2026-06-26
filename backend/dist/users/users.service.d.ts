import { PrismaService } from '../prisma/prisma.service';
export declare class UsersService {
    private prisma;
    constructor(prisma: PrismaService);
    findAllStudents(): Promise<{
        username: string;
        role: string;
        id: number;
        createdAt: Date;
    }[]>;
}
