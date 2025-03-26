import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { UserController } from './controller/user.controller';
import { UserService } from './service/user.service';
import { RedisModule } from 'src/core/cache/redis.module';
import { WorkerModule } from 'src/worker/worker.module';
import { UserRepository } from './repository/user.repository';
import { ConfigModule } from '@nestjs/config';
import { AuthMiddleware } from 'src/middlewares/auth.middleware';
import { TokenModule } from '../tokens/token.module';
import { SecurityModule } from 'src/core/security/security.module';

@Module({
  imports: [
    RedisModule,
    WorkerModule,
    TokenModule,
    ConfigModule,
    SecurityModule,
  ],
  controllers: [UserController],
  providers: [UserService, UserRepository],
  exports: [UserService, UserRepository],
})
export class UserModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware).forRoutes('user/verify', 'user/profile');
  }
}
