import { Module } from '@nestjs/common';

import { CommentController } from '@comment/controller/comment.controller';
import { CommentRepository } from '@comment/repository/comment.repository';
import { CommentService } from '@comment/service/comment.service';

import { FeedModule } from '@feed/module/feed.module';

@Module({
  imports: [FeedModule],
  controllers: [CommentController],
  providers: [CommentRepository, CommentService],
  exports: [],
})
export class CommentModule {}
