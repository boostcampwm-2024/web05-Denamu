import { Module } from '@nestjs/common';
import { CommentController } from '../controller/comment.controller';
import { CommentRepository } from '../repository/comment.repository';
import { CommentService } from '../service/comment.service';
import { FeedModule } from '../../feed/module/feed.module';
import { UserModule } from '../../user/module/user.module';

@Module({
  imports: [UserModule, FeedModule],
  controllers: [CommentController],
  providers: [CommentRepository, CommentService],
})
export class CommentModule {}
