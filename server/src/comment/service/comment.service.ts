import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';

import { DataSource } from 'typeorm';

import { CommentParamRequestDto } from '@comment/dto/request/commentParam.dto';
import { CreateCommentRequestDto } from '@comment/dto/request/createComment.dto';
import { GetCommentRequestDto } from '@comment/dto/request/getComment.dto';
import { UpdateCommentRequestDto } from '@comment/dto/request/updateComment.dto';
import { GetCommentResponseDto } from '@comment/dto/response/getComment.dto';
import { Comment } from '@comment/entity/comment.entity';
import { CommentRepository } from '@comment/repository/comment.repository';

import { Payload } from '@common/guard/jwt.guard';

import { FeedService } from '@feed/service/feed.service';

@Injectable()
export class CommentService {
  constructor(
    private readonly commentRepository: CommentRepository,
    private readonly dataSource: DataSource,
    private readonly feedService: FeedService,
  ) {}

  private async getValidatedComment(
    userInformation: Payload,
    commentId: number,
  ) {
    const commentObj = await this.commentRepository.findOne({
      where: {
        id: commentId,
      },
      relations: ['user', 'feed'],
    });

    if (!commentObj) {
      throw new NotFoundException('존재하지 않는 댓글입니다.');
    }

    if (userInformation.id !== commentObj.user.id) {
      throw new UnauthorizedException('본인이 작성한 댓글이 아닙니다.');
    }

    return commentObj;
  }

  async get(commentDto: GetCommentRequestDto) {
    await this.feedService.getFeed(commentDto.feedId);

    const comments = await this.commentRepository.getCommentInformation(
      commentDto.feedId,
    );
    return GetCommentResponseDto.toResponseDtoArray(comments);
  }

  async create(
    userInformation: Payload,
    feedId: number,
    commentDto: CreateCommentRequestDto,
  ) {
    await this.dataSource.transaction(async (manager) => {
      const feed = await this.feedService.getFeed(feedId);
      feed.commentCount++;
      await manager.save(feed);
      await manager.save(Comment, {
        comment: commentDto.comment,
        feed: { id: feedId },
        user: { id: userInformation.id },
      });
    });
  }

  async delete(userInformation: Payload, commentDto: CommentParamRequestDto) {
    const comment = await this.getValidatedComment(
      userInformation,
      commentDto.commentId,
    );

    await this.dataSource.transaction(async (manager) => {
      const feed = comment.feed;
      feed.commentCount--;
      await manager.save(feed);
      await manager.remove(comment);
    });
  }

  async update(
    userInformation: Payload,
    commentId: number,
    commentDto: UpdateCommentRequestDto,
  ) {
    const commentObj = await this.getValidatedComment(
      userInformation,
      commentId,
    );
    commentObj.comment = commentDto.newComment;
    await this.commentRepository.save(commentObj);
  }
}
