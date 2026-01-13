import { Module } from '@nestjs/common';
import { RssController } from '@rss/controller/rss.controller';
import { RssService } from '@rss/service/rss.service';
import {
  RssRejectRepository,
  RssRepository,
  RssAcceptRepository,
} from '@rss/repository/rss.repository';
import { EmailModule } from '@common/email/email.module';

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
