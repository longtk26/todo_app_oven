import { Injectable } from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';
import { PrismaService } from 'src/core/orm/prisma';
import { CreateUserRepository } from './user.types';

@Injectable()
export class UserRepository {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly logger: PinoLogger,
  ) {
    this.logger.setContext(UserRepository.name);
  }

  async getUserByEmail(email: string) {
    const user = this.prismaService.user.findUnique({
      where: {
        email,
      },
    });

    return user;
  }

  async createUser(createUserRepository: CreateUserRepository) {
    const data = this.prismaService.user.create({
      data: {
        ...createUserRepository,
      },
    });

    return data;
  }
}
