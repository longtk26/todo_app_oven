import { Module } from '@nestjs/common';
import { UserModule } from './modules/user/user.module';
import { ConfigModule } from '@nestjs/config';
import config from './config/config';
import { LoggerModule } from 'nestjs-pino';
import { specConfigsPino } from './config/logger';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [config],
    }),
    LoggerModule.forRoot(specConfigsPino),
    UserModule,
  ],
})
export class AppModule {}
