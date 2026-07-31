import { Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';

import { ThrottlerStorageRedisService } from '@nest-lab/throttler-storage-redis';
import Redis from 'ioredis';

@Module({
  imports: [
    ThrottlerModule.forRootAsync({
      inject: ['REDIS_CLIENT'],
      useFactory: (redisClient: Redis) => ({
        throttlers: [{ ttl: 60_000, limit: 5 }],
        storage: new ThrottlerStorageRedisService(redisClient),
        errorMessage: '로그인 시도가 너무 많습니다. 잠시 후 다시 시도해주세요.',
      }),
    }),
  ],
  exports: [ThrottlerModule],
})
export class LoginThrottlerModule {}
