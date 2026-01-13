import { forwardRef, Module } from '@nestjs/common';
import { LikeController } from '@like/controller/like.controller';
import { LikeService } from '@like/service/like.service';
import { LikeRepository } from '@like/repository/like.repository';
import { FeedModule } from '@feed/module/feed.module';
import { JwtAuthModule } from '@common/auth/jwt.module';

@Module({
  imports: [forwardRef(() => FeedModule), JwtAuthModule],
  controllers: [LikeController],
  providers: [LikeService, LikeRepository],
  exports: [LikeRepository],
})
export class LikeModule {}
