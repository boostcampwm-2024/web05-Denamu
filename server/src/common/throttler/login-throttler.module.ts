import { Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';

import { ThrottlerStorageRedisService } from '@nest-lab/throttler-storage-redis';

import { RedisModule } from '@common/redis/redis.module';
import { RedisService } from '@common/redis/redis.service';

@Module({
  imports: [
    ThrottlerModule.forRootAsync({
      imports: [RedisModule],
      inject: [RedisService],
      useFactory: (redisService: RedisService) => ({
        throttlers: [{ ttl: 60_000, limit: 10 }],
        storage: new ThrottlerStorageRedisService(redisService.redisClient),
        errorMessage: '로그인 시도가 너무 많습니다. 잠시 후 다시 시도해주세요.',
      }),
    }),
  ],
  exports: [ThrottlerModule],
})
export class LoginThrottlerModule {}
