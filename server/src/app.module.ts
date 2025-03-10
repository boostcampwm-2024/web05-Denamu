import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { loadDBSetting } from './common/database/load.config';
import { AdminModule } from './admin/module/admin.module';
import { RedisModule } from './common/redis/redis.module';
import { RssModule } from './rss/module/rss.module';
import { FeedModule } from './feed/module/feed.module';
import { WinstonLoggerModule } from './common/logger/logger.module';
import { ChatModule } from './chat/module/chat.module';
import { StatisticModule } from './statistic/module/statistic.module';
import { TestModule } from './common/test/test.module';
import { UserModule } from './user/module/user.module';
import { ActivityModule } from './activity/module/activity.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath:
        {
          PROD: `${process.cwd()}/env/.env.prod`,
          LOCAL: `${process.cwd()}/env/.env.local`,
          DEV: `${process.cwd()}/env/.env.local`,
        }[process.env.NODE_ENV] || '',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) =>
        loadDBSetting(configService),
    }),
    AdminModule,
    RedisModule,
    WinstonLoggerModule,
    RssModule,
    FeedModule,
    ChatModule,
    UserModule,
    ActivityModule,
    TestModule,
    StatisticModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
