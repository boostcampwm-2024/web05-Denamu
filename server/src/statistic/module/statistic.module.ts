import { FeedModule } from '@feed/module/feed.module';

import { RssModule } from '@rss/module/rss.module';

import { StatisticController } from '@statistic/controller/statistic.controller';
import { StatisticService } from '@statistic/service/statistic.service';

import { Module } from '@nestjs/common';

@Module({
  imports: [FeedModule, RssModule],
  controllers: [StatisticController],
  providers: [StatisticService],
})
export class StatisticModule {}
