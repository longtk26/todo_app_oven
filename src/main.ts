import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger as LoggerPino } from 'nestjs-pino';
import { ValidationPipe } from '@nestjs/common';
import { HttpExceptionFilter } from './filter/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });
  app.useLogger(app.get(LoggerPino));
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalPipes(new ValidationPipe());
  await app.listen(process.env.PORT ?? 3000, () => {
    // Using pino logger
    app.get(LoggerPino).log('Todo app is running on port ' + process.env.PORT);
  });
}

bootstrap();
