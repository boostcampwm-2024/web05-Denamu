import { forwardRef, Module } from '@nestjs/common';
import { LikeController } from '../controller/like.controller';
import { LikeService } from '../service/like.service';
import { LikeRepository } from '../repository/like.repository';
import { FeedModule } from '../../feed/module/feed.module';

@Module({
  imports: [forwardRef(() => FeedModule)],
  controllers: [LikeController],
  providers: [LikeService, LikeRepository],
  exports: [LikeRepository],
})
export class LikeModule {}
