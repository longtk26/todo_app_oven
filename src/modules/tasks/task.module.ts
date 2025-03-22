import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { PrismaModule } from 'src/core/orm/prisma.module';
import { RedisModule } from 'src/core/cache/redis.module';
import { TaskController } from './controller/task.controller';
import { AuthMiddleware } from 'src/middlewares/auth.middleware';
import { TaskService } from './service/task.service';
import { TaskRepository } from './repository/task.reposiroty';
import { WorkerModule } from 'src/worker/worker.module';
import { UserModule } from '../user/user.module';

@Module({
  imports: [PrismaModule, RedisModule, WorkerModule, UserModule],
  controllers: [TaskController],
  providers: [
    TaskService,
    TaskRepository,
  ],
})
export class TaskModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware).forRoutes(TaskController);
  }
}
