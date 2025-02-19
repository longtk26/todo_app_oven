import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger as LoggerPino } from 'nestjs-pino';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });
  app.useLogger(app.get(LoggerPino));
  await app.listen(process.env.PORT ?? 3000, () => {
    // Using pino logger
    app.get(LoggerPino).log('App is running on port ' + process.env.PORT);
  });
}

bootstrap();
