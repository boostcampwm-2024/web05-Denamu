import { Module } from '@nestjs/common';
import { StatisticService } from '../service/statistic.service';
import { StatisticController } from '../controller/statistic.controller';
import { FeedRepository } from '../../feed/repository/feed.repository';
import { RssAcceptRepository } from '../../rss/repository/rss.repository';

@Module({
  controllers: [StatisticController],
  providers: [StatisticService, FeedRepository, RssAcceptRepository],
})
export class StatisticModule {}
