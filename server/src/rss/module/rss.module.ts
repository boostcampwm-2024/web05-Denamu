import { Module } from '@nestjs/common';
import { RssController } from '../controller/rss.controller';
import { RssService } from '../service/rss.service';
import {
  RssRejectRepository,
  RssRepository,
  RssAcceptRepository,
} from '../repository/rss.repository';
import { EmailModule } from '../../common/email/email.module';

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
