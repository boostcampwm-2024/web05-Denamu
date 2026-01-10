import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';

import * as fs from 'fs';
import * as path from 'path';

import { ActivityModule } from '@activity/module/activity.module';

import { AdminModule } from '@admin/module/admin.module';

import { ChatModule } from '@chat/module/chat.module';

import { CommentModule } from '@comment/module/comment.module';

import { loadDBSetting } from '@common/database/load.config';
import { EmailModule } from '@common/email/email.module';
import { WinstonLoggerModule } from '@common/logger/logger.module';
import { MetricsInterceptor } from '@common/metrics/metrics.interceptor';
import { MetricsModule } from '@common/metrics/metrics.module';
import { RabbitMQModule } from '@common/rabbitmq/rabbitmq.module';
import { RedisModule } from '@common/redis/redis.module';

import { FeedModule } from '@feed/module/feed.module';

import { FileModule } from '@file/module/file.module';

import { LikeModule } from '@like/module/like.module';

import { RssModule } from '@rss/module/rss.module';

import { StatisticModule } from '@statistic/module/statistic.module';

import { TagModule } from '@tag/module/tag.module';

import { UserModule } from '@user/module/user.module';

const envMap = {
  LOCAL: path.join(process.cwd(), 'env/.env.local'),
  DEV: path.join(process.cwd(), 'env/.env.local'),
} as const;

// PROD 및 TEST 환경에서는 런타임 환경 변수만 사용
const chosen =
  process.env.NODE_ENV !== 'PROD' && process.env.NODE_ENV !== 'TEST'
    ? envMap[process.env.NODE_ENV as keyof typeof envMap]
    : undefined;

if (process.env.NODE_ENV !== 'PROD' && process.env.NODE_ENV !== 'TEST') {
  if (!chosen) {
    throw new Error(`Unknown NODE_ENV: ${process.env.NODE_ENV}`);
  }
  if (!fs.existsSync(chosen)) {
    throw new Error(`Environment file not found: ${chosen}`);
  }
}

const exists = !!chosen && fs.existsSync(chosen);
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      ignoreEnvFile: !exists,
      envFilePath: exists ? chosen : undefined,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) =>
        loadDBSetting(configService),
    }),
    WinstonLoggerModule,
    RedisModule,
    EmailModule,
    MetricsModule,
    AdminModule,
    RssModule,
    FeedModule,
    ChatModule,
    UserModule,
    TagModule,
    ActivityModule,
    StatisticModule,
    CommentModule,
    LikeModule,
    FileModule,
    RabbitMQModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: MetricsInterceptor,
    },
  ],
})
export class AppModule {}
