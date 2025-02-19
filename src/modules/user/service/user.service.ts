import { BadRequestException, Injectable } from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';
import { RedisClient } from 'src/core/cache/redis';
import { PrismaService } from 'src/core/orm/prisma';

@Injectable()
export class UserSerivce {
  constructor(
    private prismaService: PrismaService,
    private redisClient: RedisClient,
    private readonly logger: PinoLogger,
  ) {
    this.logger.setContext(UserSerivce.name);
  }
  async getUsers() {
    // set cache
    await this.redisClient.set('users', {
      message: 'This is a hash',
      data: 'This is a value',
    });
    // get cache
    const cache = await this.redisClient.get('users');
    this.logger.info(`Get cache: ${cache}`);
    const user = await this.prismaService.user.findMany();
    if (!user.length) {
      throw new BadRequestException('User not found');
    }
    this.logger.info(user, 'Get all users');
    return user;
  }
}
