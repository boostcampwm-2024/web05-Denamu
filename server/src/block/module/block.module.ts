import { Module } from '@nestjs/common';

import { BlockController } from '@block/controller/block.controller';
import { RssBlockRepository } from '@block/repository/rssBlock.repository';
import { UserBlockRepository } from '@block/repository/userBlock.repository';
import { BlockService } from '@block/service/block.service';

import { JwtAuthModule } from '@common/auth/jwt.module';

import { RssAcceptRepository } from '@rss/repository/rss.repository';

import { UserModule } from '@user/module/user.module';

@Module({
  imports: [JwtAuthModule, UserModule],
  controllers: [BlockController],
  providers: [
    BlockService,
    UserBlockRepository,
    RssBlockRepository,
    RssAcceptRepository,
  ],
  exports: [],
})
export class BlockModule {}
