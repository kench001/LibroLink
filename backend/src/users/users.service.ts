import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAllStudents() {
    return this.prisma.user.findMany({
      where: { role: 'student' },
      select: {
        id: true,
        username: true,
        role: true,
        createdAt: true,
      },
      orderBy: { username: 'asc' },
    });
  }
}
