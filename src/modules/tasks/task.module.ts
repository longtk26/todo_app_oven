import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { RedisModule } from 'src/core/cache/redis.module';
import { TaskController } from './controller/task.controller';
import { AuthMiddleware } from 'src/middlewares/auth.middleware';
import { TaskService } from './service/task.service';
import { TaskRepository } from './repository/task.reposiroty';
import { WorkerModule } from 'src/worker/worker.module';
import { UserModule } from '../user/user.module';
import { SecurityModule } from 'src/core/security/security.module';

@Module({
  imports: [RedisModule, WorkerModule, UserModule, SecurityModule],
  controllers: [TaskController],
  providers: [TaskService, TaskRepository],
})
export class TaskModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware).forRoutes(TaskController);
  }
}
