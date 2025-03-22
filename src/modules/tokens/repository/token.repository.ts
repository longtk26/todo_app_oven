import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/core/orm/prisma';

@Injectable()
export class TokenRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async getTokenByUserId(userId: string) {
    const token = this.prismaService.tokens.findFirst({
      where: {
        userId,
      },
    });

    return token;
  }

  async createToken(userId: string, token: string) {
    const data = this.prismaService.tokens.create({
      data: {
        userId,
        token,
      },
    });

    return data;
  }

  async getToken(token: string) {
    const data = this.prismaService.tokens.findFirst({
      where: {
        token,
      },
    });

    return data;
  }

  async deleteToken(token: string) {
    const data = this.prismaService.tokens.delete({
      where: {
        token,
      },
    });

    return data;
  }
}
