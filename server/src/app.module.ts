import { Module } from '@nestjs/common';
import * as path from 'path';
import * as fs from 'fs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { loadDBSetting } from '@src/common/database/load.config';
import { AdminModule } from '@src/admin/module/admin.module';
import { RedisModule } from '@src/common/redis/redis.module';
import { RssModule } from '@src/rss/module/rss.module';
import { FeedModule } from '@src/feed/module/feed.module';
import { WinstonLoggerModule } from '@src/common/logger/logger.module';
import { ChatModule } from '@src/chat/module/chat.module';
import { StatisticModule } from '@src/statistic/module/statistic.module';
import { UserModule } from '@src/user/module/user.module';
import { ActivityModule } from '@src/activity/module/activity.module';
import { EmailModule } from '@src/common/email/email.module';
import { CommentModule } from '@src/comment/module/comment.module';
import { MetricsModule } from '@src/common/metrics/metrics.module';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { MetricsInterceptor } from '@src/common/metrics/metrics.interceptor';
import { LikeModule } from '@src/like/module/like.module';
import { FileModule } from '@src/file/module/file.module';
import { RabbitMQModule } from '@src/common/rabbitmq/rabbitmq.module';
import { TagModule } from '@src/tag/module/tag.module';

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
