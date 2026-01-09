import { HttpExceptionsFilter } from '@src/common/filters/http.exception.filter';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '@src/app.module';
import { setupSwagger } from '@src/common/swagger/swagger';
import * as cookieParser from 'cookie-parser';
import { InternalExceptionsFilter } from '@src/common/filters/internal.exceptions.filter';
import { LoggingInterceptor } from '@src/common/logger/logger.interceptor';
import { WinstonLoggerService } from '@src/common/logger/logger.service';
import { ValidationPipe } from '@nestjs/common';

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
