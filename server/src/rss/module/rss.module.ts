import { Module } from '@nestjs/common';

import { EmailModule } from '@common/email/email.module';

import { RssController } from '@rss/controller/rss.controller';
import {
  RssAcceptRepository,
  RssRejectRepository,
  RssRepository,
} from '@rss/repository/rss.repository';
import { RssService } from '@rss/service/rss.service';

@Module({
  imports: [EmailModule],
  controllers: [RssController],
  providers: [
    RssService,
    RssRepository,
    RssAcceptRepository,
    RssRejectRepository,
  ],
  exports: [RssAcceptRepository],
})
export class RssModule {}
