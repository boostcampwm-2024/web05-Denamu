import { ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from '../../../../src/app.module';
import { WinstonLoggerService } from '../../../../src/common/logger/logger.service';
import { InternalExceptionsFilter } from '../../../../src/common/filters/internal.exceptions.filter';
import { HttpExceptionsFilter } from '../../../../src/common/filters/http.exception.filter';
import * as cookieParser from 'cookie-parser';
import { RedisService } from '../../../../src/common/redis/redis.service';
import { UserService } from '../../../../src/user/service/user.service';

const globalAny: any = global;

afterEach(() => {
  jest.resetAllMocks();
});

beforeAll(async () => {
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
});

afterAll(async () => {
  const redisService: RedisService = globalAny.testApp.get(RedisService);
  redisService.disconnect();

  if (globalAny.testApp) {
    await globalAny.testApp.close();
    delete globalAny.testApp;
  }
});

export const createAccessToken = (payload?: {
  id: number;
  email?: string;
  userName?: string;
  role?: string;
}) => {
  const userService = globalAny.testApp.get(UserService);

  return userService.createToken(
    {
      id: payload?.id ?? 1,
      email: payload?.email ?? 'test@test.com',
      userName: payload?.userName ?? 'testuser',
      role: payload?.role ?? 'user',
    },
    'access',
  );
};

export const createRefreshToken = (payload?: {
  id: number;
  email?: string;
  userName?: string;
  role?: string;
}) => {
  const userService = globalAny.testApp.get(UserService);

  return userService.createToken(
    {
      id: payload?.id ?? 1,
      email: payload?.email ?? 'test@test.com',
      userName: payload?.userName ?? 'testuser',
      role: payload?.role ?? 'user',
    },
    'refresh',
  );
};
