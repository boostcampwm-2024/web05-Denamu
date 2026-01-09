import { Module } from '@nestjs/common';
import { RssController } from '@src/rss/controller/rss.controller';
import { RssService } from '@src/rss/service/rss.service';
import {
  RssRejectRepository,
  RssRepository,
  RssAcceptRepository,
} from '@src/rss/repository/rss.repository';
import { EmailModule } from '@src/common/email/email.module';

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
