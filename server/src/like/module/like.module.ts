import { forwardRef, Module } from '@nestjs/common';
import { LikeController } from '../controller/like.controller';
import { LikeService } from '../service/like.service';
import { LikeRepository } from '../repository/like.repository';
import { FeedModule } from '../../feed/module/feed.module';
import { InjectUserInterceptor } from '../../common/auth/jwt.interceptor';
import { JwtAuthModule } from '../../common/auth/jwt.module';

@Module({
  imports: [forwardRef(() => FeedModule), JwtAuthModule],
  controllers: [LikeController],
  providers: [LikeService, LikeRepository, InjectUserInterceptor],
  exports: [LikeRepository],
})
export class LikeModule {}
