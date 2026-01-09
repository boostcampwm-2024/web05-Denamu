import { forwardRef, Module } from '@nestjs/common';
import { LikeController } from '@src/like/controller/like.controller';
import { LikeService } from '@src/like/service/like.service';
import { LikeRepository } from '@src/like/repository/like.repository';
import { FeedModule } from '@src/feed/module/feed.module';
import { JwtAuthModule } from '@src/common/auth/jwt.module';

@Module({
  imports: [forwardRef(() => FeedModule), JwtAuthModule],
  controllers: [LikeController],
  providers: [LikeService, LikeRepository],
  exports: [LikeRepository],
})
export class LikeModule {}
