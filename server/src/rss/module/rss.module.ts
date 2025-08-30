import { Module } from '@nestjs/common';
import { RssController } from '../controller/rss.controller';
import { RssService } from '../service/rss.service';
import {
  RssRejectRepository,
  RssRepository,
  RssAcceptRepository,
} from '../repository/rss.repository';
import { RssParserService } from '../service/rssParser.service';
import { EmailModule } from '../../common/email/email.module';
import { FeedModule } from '../../feed/module/feed.module';

@Module({
  imports: [EmailModule, FeedModule],
  controllers: [RssController],
  providers: [
    RssService,
    RssParserService,
    RssRepository,
    RssAcceptRepository,
    RssRejectRepository,
  ],
  exports: [RssAcceptRepository, RssParserService],
})
export class RssModule {}
