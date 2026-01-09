import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CommentRepository } from '@src/comment/repository/comment.repository';
import { CreateCommentRequestDto } from '@src/comment/dto/request/createComment.dto';
import { Payload } from '@src/common/guard/jwt.guard';
import { DeleteCommentRequestDto } from '@src/comment/dto/request/deleteComment.dto';
import { UpdateCommentRequestDto } from '@src/comment/dto/request/updateComment.dto';
import { GetCommentRequestDto } from '@src/comment/dto/request/getComment.dto';
import { DataSource } from 'typeorm';
import { Comment } from '@src/comment/entity/comment.entity';
import { GetCommentResponseDto } from '@src/comment/dto/response/getComment.dto';
import { FeedService } from '@src/feed/service/feed.service';
import { UserService } from '@src/user/service/user.service';

@Injectable()
export class CommentService {
  constructor(
    private readonly commentRepository: CommentRepository,
    private readonly dataSource: DataSource,
    private readonly userService: UserService,
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

  async create(userInformation: Payload, commentDto: CreateCommentRequestDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const feed = await this.feedService.getFeed(commentDto.feedId);
      await this.userService.getUser(userInformation.id);
      feed.commentCount++;
      await queryRunner.manager.save(feed);
      await queryRunner.manager.save(Comment, {
        comment: commentDto.comment,
        feed: { id: commentDto.feedId },
        user: { id: userInformation.id },
      });

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async delete(userInformation: Payload, commentDto: DeleteCommentRequestDto) {
    const comment = await this.getValidatedComment(
      userInformation,
      commentDto.commentId,
    );

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const feed = comment.feed;
      feed.commentCount--;
      await queryRunner.manager.save(feed);
      await queryRunner.manager.remove(comment);

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async update(userInformation: Payload, commentDto: UpdateCommentRequestDto) {
    const commentObj = await this.getValidatedComment(
      userInformation,
      commentDto.commentId,
    );
    commentObj.comment = commentDto.newComment;
    await this.commentRepository.save(commentObj);
  }
}
