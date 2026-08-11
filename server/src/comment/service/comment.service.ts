import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';

import { DataSource } from 'typeorm';

import { CommentParamRequestDto } from '@comment/dto/request/commentParam.dto';
import { CreateCommentRequestDto } from '@comment/dto/request/createComment.dto';
import { GetCommentRequestDto } from '@comment/dto/request/getComment.dto';
import { GetUserCommentsRequestDto } from '@comment/dto/request/getUserComments.dto';
import { UpdateCommentRequestDto } from '@comment/dto/request/updateComment.dto';
import { GetCommentResponseDto } from '@comment/dto/response/getComment.dto';
import { GetUserCommentsResponseDto } from '@comment/dto/response/getUserComments.dto';
import { Comment } from '@comment/entity/comment.entity';
import { CommentCreatedEvent } from '@comment/event/comment-created.event';
import { CommentDeletedEvent } from '@comment/event/comment-deleted.event';
import { CommentRepository } from '@comment/repository/comment.repository';

import { Payload } from '@common/guard/jwt.guard';

import { FeedService } from '@feed/service/feed.service';

import { UserService } from '@user/service/user.service';

@Injectable()
export class CommentService {
  constructor(
    private readonly commentRepository: CommentRepository,
    private readonly dataSource: DataSource,
    private readonly feedService: FeedService,
    private readonly userService: UserService,
    private readonly eventEmitter: EventEmitter2,
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
      throw new ForbiddenException('본인이 작성한 댓글이 아닙니다.');
    }

    return commentObj;
  }

  private async getDeletableComment(
    userInformation: Payload,
    commentId: number,
  ) {
    const commentObj = await this.commentRepository.findOne({
      where: {
        id: commentId,
      },
      relations: ['user', 'feed', 'feed.blog', 'parent', 'parent.user'],
    });

    if (!commentObj) {
      throw new NotFoundException('존재하지 않는 댓글입니다.');
    }

    const isAuthor = userInformation.id === commentObj.user.id;
    const isFeedOwner = userInformation.id === commentObj.feed.blog?.userId;
    if (!isAuthor && !isFeedOwner) {
      throw new ForbiddenException('댓글을 삭제할 권한이 없습니다.');
    }

    return commentObj;
  }

  async get(
    commentDto: GetCommentRequestDto,
    requester: Payload | null = null,
  ) {
    await this.feedService.getPublicFeed(commentDto.feedId);

    const comments = await this.commentRepository.getCommentInformation(
      commentDto.feedId,
      requester?.id,
    );
    return GetCommentResponseDto.toResponseDtoArray(comments);
  }

  async getCommentsByUser(
    userId: number,
    commentDto: GetUserCommentsRequestDto,
  ) {
    await this.userService.getUser(userId);

    const comments = await this.commentRepository.getCommentsByUser(
      userId,
      commentDto.lastId,
      commentDto.limit,
    );

    const hasMore = comments.length > commentDto.limit;
    if (hasMore) comments.pop();
    const lastId = comments.length ? comments[comments.length - 1].id : 0;

    return GetUserCommentsResponseDto.toResponseDto(comments, lastId, hasMore);
  }

  private async validateParentComment(parentId: number, feedId: number) {
    const parent = await this.commentRepository.findOne({
      where: { id: parentId },
      relations: ['feed', 'user'],
    });

    if (!parent) {
      throw new NotFoundException('존재하지 않는 부모 댓글입니다.');
    }
    if (parent.feed.id !== feedId) {
      throw new BadRequestException(
        '부모 댓글이 해당 게시글에 속하지 않습니다.',
      );
    }
    if (parent.parentId !== null) {
      throw new BadRequestException('답글에는 답글을 달 수 없습니다.');
    }

    return parent;
  }

  async create(
    userInformation: Payload,
    feedId: number,
    commentDto: CreateCommentRequestDto,
  ) {
    let parentAuthorId: number | null = null;

    await this.dataSource.transaction(async (manager) => {
      const feed = await this.feedService.getPublicFeed(feedId);

      if (commentDto.parentId) {
        const parent = await this.validateParentComment(
          commentDto.parentId,
          feedId,
        );
        parentAuthorId = parent.user.id;
      }

      feed.commentCount++;
      await manager.save(feed);
      await manager.save(Comment, {
        comment: commentDto.comment,
        feed,
        user: { id: userInformation.id },
        parentId: commentDto.parentId ?? null,
      });
    });

    this.eventEmitter.emit(
      'comment.created',
      new CommentCreatedEvent(feedId, userInformation.id, parentAuthorId),
    );
  }

  async delete(userInformation: Payload, commentDto: CommentParamRequestDto) {
    const comment = await this.getDeletableComment(
      userInformation,
      commentDto.commentId,
    );

    const parentAuthorId = comment.parent?.user.id ?? null;

    const replyCount =
      comment.parentId === null
        ? await this.commentRepository.count({
            where: { parentId: comment.id },
          })
        : 0;

    let commentCountDelta = 0;

    await this.dataSource.transaction(async (manager) => {
      if (replyCount > 0) {
        comment.isDeleted = true;
        await manager.save(comment);
        return;
      }

      const feed = comment.feed;
      await manager.remove(comment);
      feed.commentCount--;
      commentCountDelta--;

      if (comment.parent?.isDeleted) {
        const remainingReplyCount = await manager.count(Comment, {
          where: { parentId: comment.parentId },
        });

        if (remainingReplyCount === 0) {
          await manager.remove(comment.parent);
          feed.commentCount--;
          commentCountDelta--;
        }
      }

      await manager.save(feed);
    });

    this.eventEmitter.emit(
      'comment.deleted',
      new CommentDeletedEvent(
        comment.feed.id,
        parentAuthorId,
        commentCountDelta,
      ),
    );
  }

  async deleteByAdmin(commentId: number) {
    const comment = await this.commentRepository.findOne({
      where: { id: commentId },
      relations: ['feed', 'parent', 'parent.user'],
    });

    if (!comment) {
      throw new NotFoundException('존재하지 않는 댓글입니다.');
    }

    comment.isDeleted = true;
    comment.isAdminDeleted = true;
    await this.commentRepository.save(comment);

    this.eventEmitter.emit(
      'comment.deleted',
      new CommentDeletedEvent(
        comment.feed.id,
        comment.parent?.user.id ?? null,
        0,
      ),
    );
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
    if (commentObj.isDeleted) {
      throw new NotFoundException('삭제된 댓글입니다.');
    }
    commentObj.comment = commentDto.newComment;
    await this.commentRepository.save(commentObj);
  }
}
