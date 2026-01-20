import { forwardRef } from '@nestjs/common';
import { Module } from '@nestjs/common';

import { CommentController } from '@comment/controller/comment.controller';
import { CommentRepository } from '@comment/repository/comment.repository';
import { CommentService } from '@comment/service/comment.service';

import { FeedModule } from '@feed/module/feed.module';

import { UserModule } from '@user/module/user.module';

@Module({
  imports: [UserModule, forwardRef(() => FeedModule)],
  controllers: [CommentController],
  providers: [CommentRepository, CommentService],
  exports: [CommentRepository],
})
export class CommentModule {}
