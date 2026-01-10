import { JwtAuthModule } from '@common/auth/jwt.module';

import { FeedModule } from '@feed/module/feed.module';

import { LikeController } from '@like/controller/like.controller';
import { LikeRepository } from '@like/repository/like.repository';
import { LikeService } from '@like/service/like.service';

import { Module, forwardRef } from '@nestjs/common';

@Module({
  imports: [forwardRef(() => FeedModule), JwtAuthModule],
  controllers: [LikeController],
  providers: [LikeService, LikeRepository],
  exports: [LikeRepository],
})
export class LikeModule {}
