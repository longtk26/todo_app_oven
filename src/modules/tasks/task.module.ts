import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/core/orm/prisma.module';
import { RedisModule } from 'src/core/cache/redis.module';

@Module({
  imports: [PrismaModule, RedisModule],
  controllers: [],
  providers: [],
})
export class TaskModule {}
