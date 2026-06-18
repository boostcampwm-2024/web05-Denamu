import { Module } from '@nestjs/common';

import { JwtAuthModule } from '@common/auth/jwt.module';
import { NotifierModule } from '@common/notification/notifier.module';

import { AdminModule } from '@admin/module/admin.module';

import { RssController } from '@rss/controller/rss.controller';
import {
  RssAcceptRepository,
  RssRejectRepository,
  RssRepository,
} from '@rss/repository/rss.repository';
import { RssService } from '@rss/service/rss.service';

@Module({
  imports: [AdminModule, NotifierModule, JwtAuthModule],
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
