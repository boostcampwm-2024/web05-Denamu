import { ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { WinstonLoggerService } from '../src/common/logger/logger.service';
import { InternalExceptionsFilter } from '../src/common/filters/internal-exceptions.filter';
import { HttpExceptionsFilter } from '../src/common/filters/http-exception.filter';
import * as cookieParser from 'cookie-parser';
import { TestService } from '../src/common/test/test.service';
import { RedisService } from '../src/common/redis/redis.service';

const globalAny: any = global;

beforeAll(async () => {
  console.log('Initializing NestJS application...');
  const moduleFixture = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const app = moduleFixture.createNestApplication();
  const logger = app.get(WinstonLoggerService);
  app.setGlobalPrefix('api');
  app.use(cookieParser());
  app.useGlobalFilters(
    new InternalExceptionsFilter(logger),
    new HttpExceptionsFilter(),
  );
  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  await app.init();
  globalAny.testApp = app;

  console.log('NestJS application initialized.');
});

afterAll(async () => {
  const testService = globalAny.testApp.get(TestService);
  await testService.cleanDatabase();

  const redisService: RedisService = globalAny.testApp.get(RedisService);
  await redisService.flushall();
  await redisService.disconnect();

  console.log('Closing NestJS application...');
  if (globalAny.testApp) {
    await globalAny.testApp.close();
    delete globalAny.testApp;
  }
  console.log('NestJS application closed.');
});
