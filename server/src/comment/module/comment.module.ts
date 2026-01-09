import { forwardRef } from '@nestjs/common';
import { Module } from '@nestjs/common';
import { CommentController } from '@src/comment/controller/comment.controller';
import { CommentRepository } from '@src/comment/repository/comment.repository';
import { CommentService } from '@src/comment/service/comment.service';
import { FeedModule } from '@src/feed/module/feed.module';
import { UserModule } from '@src/user/module/user.module';

@Module({
  imports: [UserModule, forwardRef(() => FeedModule)],
  controllers: [CommentController],
  providers: [CommentRepository, CommentService],
  exports: [CommentRepository],
})
export class CommentModule {}
