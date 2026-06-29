import { Module } from '@nestjs/common';

import { AdminCommentController } from '@comment/controller/adminComment.controller';
import { CommentController } from '@comment/controller/comment.controller';
import { UserCommentController } from '@comment/controller/userComment.controller';
import { CommentRepository } from '@comment/repository/comment.repository';
import { CommentService } from '@comment/service/comment.service';

import { FeedModule } from '@feed/module/feed.module';

import { UserModule } from '@user/module/user.module';

@Module({
  imports: [FeedModule, UserModule],
  controllers: [CommentController, UserCommentController, AdminCommentController],
  providers: [CommentRepository, CommentService],
  exports: [],
})
export class CommentModule {}
