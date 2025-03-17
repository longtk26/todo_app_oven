import { Module } from '@nestjs/common';
import { UserController } from './controller/user.controller';
import { UserSerivce } from './service/user.service';
import { PrismaModule } from 'src/core/orm/prisma.module';
import { RedisModule } from 'src/core/cache/redis.module';
import { WorkerModule } from 'src/worker/worker.module';
import { UserRepository } from './repository/user.repository';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [PrismaModule, RedisModule, WorkerModule],
  controllers: [UserController],
  providers: [UserSerivce, UserRepository, ConfigService],
})
export class UserModule {}
