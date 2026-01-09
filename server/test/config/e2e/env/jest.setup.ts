import { ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from '@src/app.module';
import { WinstonLoggerService } from '@src/common/logger/logger.service';
import { InternalExceptionsFilter } from '@src/common/filters/internal.exceptions.filter';
import { HttpExceptionsFilter } from '@src/common/filters/http.exception.filter';
import cookieParser from 'cookie-parser';
import { RedisService } from '@src/common/redis/redis.service';
import { UserService } from '@src/user/service/user.service';
import { NestApplication } from '@nestjs/core';
import { DataSource } from 'typeorm';

export let testApp: NestApplication;

afterEach(async () => {
  const redisService = testApp.get(RedisService);
  await redisService.flushdb();

  const dataSource = testApp.get(DataSource);
  const queryRunner = dataSource.createQueryRunner();
  await queryRunner.connect();

  await queryRunner.query('SET FOREIGN_KEY_CHECKS = 0');

  for (const entity of dataSource.entityMetadatas) {
    if (entity.tableType === 'view') {
      continue;
    }

    await queryRunner.query(`TRUNCATE TABLE \`${entity.tableName}\``);
  }

  await queryRunner.query('SET FOREIGN_KEY_CHECKS = 1');
  await queryRunner.release();

  jest.resetAllMocks();
});

beforeAll(async () => {
  const moduleFixture = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  testApp = moduleFixture.createNestApplication();
  const logger = testApp.get(WinstonLoggerService);
  testApp.setGlobalPrefix('api');
  testApp.use(cookieParser());
  testApp.useGlobalFilters(
    new InternalExceptionsFilter(logger),
    new HttpExceptionsFilter(),
  );
  testApp.useGlobalPipes(new ValidationPipe({ transform: true }));
  await testApp.init();
});

afterAll(async () => {
  const redisService: RedisService = testApp.get(RedisService);
  redisService.disconnect();

  if (testApp) {
    await testApp.close();
  }
});

export const createAccessToken = (payload?: {
  id: number;
  email?: string;
  userName?: string;
  role?: string;
}) => {
  const userService = testApp.get(UserService);

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
  const userService = testApp.get(UserService);

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
