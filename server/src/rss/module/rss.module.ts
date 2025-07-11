import { Module } from '@nestjs/common';
import { RssController } from '../controller/rss.controller';
import { RssService } from '../service/rss.service';
import {
  RssRejectRepository,
  RssRepository,
  RssAcceptRepository,
} from '../repository/rss.repository';
import { FeedCrawlerService } from '../service/feed-crawler.service';
import { FeedRepository } from '../../feed/repository/feed.repository';
import { RssParserService } from '../service/rss-parser.service';
import { EmailModule } from '../../common/email/email.module';

@Module({
  imports: [EmailModule],
  controllers: [RssController],
  providers: [
    RssService,
    FeedCrawlerService,
    RssParserService,
    RssRepository,
    RssAcceptRepository,
    RssRejectRepository,
    FeedRepository,
  ],
})
export class RssModule {}
