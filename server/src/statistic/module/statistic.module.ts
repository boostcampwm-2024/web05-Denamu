import { Module } from '@nestjs/common';
import { StatisticService } from '@src/statistic/service/statistic.service';
import { StatisticController } from '@src/statistic/controller/statistic.controller';
import { FeedModule } from '@src/feed/module/feed.module';
import { RssModule } from '@src/rss/module/rss.module';

@Module({
  imports: [FeedModule, RssModule],
  controllers: [StatisticController],
  providers: [StatisticService],
})
export class StatisticModule {}
