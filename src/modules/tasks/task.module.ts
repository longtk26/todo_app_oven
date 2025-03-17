import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { PrismaModule } from 'src/core/orm/prisma.module';
import { RedisModule } from 'src/core/cache/redis.module';
import { TaskController } from './controller/task.controller';
import { AuthMiddleware } from 'src/middlewares/auth.middleware';

@Module({
  imports: [PrismaModule, RedisModule],
  controllers: [TaskController],
  providers: [],
})
export class TaskModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware).forRoutes(TaskController);
  }
}
