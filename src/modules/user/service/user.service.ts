import { BadRequestException, Injectable } from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';
import { RedisClient } from 'src/core/cache/redis';
import { PrismaService } from 'src/core/orm/prisma';
import { WorkerProducer } from 'src/worker/worker.producer';
import { WorkerQueuesEnum } from 'src/worker/worker.queues';

@Injectable()
export class UserSerivce {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly redisClient: RedisClient,
    private readonly logger: PinoLogger,
    private readonly workerProducer: WorkerProducer,
  ) {
    this.logger.setContext(UserSerivce.name);
  }
  async getUsers() {
    // Get users from cache
    const users = await this.redisClient.get('user');
    if (users) {
      this.logger.info('===Get users from cache===');
      return users;
    }

    // Get users from database
    const usersFromDb = await this.prismaService.user.findMany();
    if (!usersFromDb) {
      throw new BadRequestException('===No user found===');
    }

    // Save users to cache
    await this.redisClient.set('user', JSON.stringify(usersFromDb));
    this.logger.info('===Save users to cache===');


    // Notify worker to send email
    this.workerProducer.produceJob(WorkerQueuesEnum.EMAIL_QUEUE, "Send email to all users");
    this.logger.info('===Notify worker to send email===');

    return usersFromDb;

  }
}
