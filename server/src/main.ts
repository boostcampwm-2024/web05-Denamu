import { AppModule } from '@src/app.module';

import { HttpExceptionsFilter } from '@common/filters/http.exception.filter';
import { InternalExceptionsFilter } from '@common/filters/internal.exceptions.filter';
import { LoggingInterceptor } from '@common/logger/logger.interceptor';
import { WinstonLoggerService } from '@common/logger/logger.service';
import { setupSwagger } from '@common/swagger/swagger';

import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = app.get(WinstonLoggerService);
  app.setGlobalPrefix('api');
  app.use(cookieParser());
  app.useGlobalInterceptors(new LoggingInterceptor(logger));
  app.useGlobalFilters(
    new InternalExceptionsFilter(logger),
    new HttpExceptionsFilter(),
  );
  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  app.enableCors({
    origin: [
      'http://localhost:5173',
      'http://localhost:4173',
      'https://www.denamu.dev',
      'https://denamu.dev',
    ],
    credentials: true,
  });
  setupSwagger(app);
  await app.listen(process.env.SERVER_PORT ?? 3000);
}

void bootstrap();
