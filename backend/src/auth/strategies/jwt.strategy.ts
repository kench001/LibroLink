import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';
import { Request } from 'express';
import { PrismaService } from '../../prisma/prisma.service';

const cookieExtractor = (req: Request): string | null => {
  if (req && req.cookies) {
    return req.cookies['jwt'] || null;
  }
  return null;
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private prisma: PrismaService) {
    super({
      jwtFromRequest: cookieExtractor,
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'super-secret-key-change-in-production',
    });
  }

  async validate(payload: any) {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      select: {
        id: true,
        username: true,
        role: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException();
    }

    return user;
  }
}
