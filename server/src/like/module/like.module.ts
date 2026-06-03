import { Module } from '@nestjs/common';

import { JwtAuthModule } from '@common/auth/jwt.module';

import { FeedModule } from '@feed/module/feed.module';

import { LikeController } from '@like/controller/like.controller';
import { LikeRepository } from '@like/repository/like.repository';
import { LikeService } from '@like/service/like.service';

import { UserModule } from '@user/module/user.module';

@Module({
  imports: [FeedModule, JwtAuthModule, UserModule],
  controllers: [LikeController],
  providers: [LikeService, LikeRepository],
  exports: [],
})
export class LikeModule {}
