import { Module } from '@nestjs/common';
import { StatisticService } from '../service/statistic.service';
import { StatisticController } from '../controller/statistic.controller';
import { FeedModule } from '../../feed/module/feed.module';
import { RssModule } from '../../rss/module/rss.module';

@Module({
  imports: [FeedModule, RssModule],
  controllers: [StatisticController],
  providers: [StatisticService],
})
export class StatisticModule {}
