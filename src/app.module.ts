import { Module } from '@nestjs/common';
import { UserModule } from './modules/user/user.module';
import { ConfigModule } from '@nestjs/config';
import config from './config/config';
import { LoggerModule } from 'nestjs-pino';
import { specConfigsPino } from './config/logger';
import { RedisModule } from './core/cache/redis.module';
import { WorkerModule } from './worker/worker.module';
import { APP_FILTER } from '@nestjs/core';
import { HttpExceptionFilter } from './core/response/http-exception.response';
import { TaskModule } from './modules/tasks/task.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [config],
    }),
    LoggerModule.forRoot(specConfigsPino),
    UserModule,
    TaskModule,
    RedisModule,
    WorkerModule,
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
  ],
})
export class AppModule {}
