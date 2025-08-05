import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CommentRepository } from '../repository/comment.repository';
import { CreateCommentRequestDto } from '../dto/request/create-comment.dto';
import { FeedRepository } from '../../feed/repository/feed.repository';
import { UserRepository } from '../../user/repository/user.repository';
import { Payload } from '../../common/guard/jwt.guard';
import { DeleteCommentRequestDto } from '../dto/request/delete-comment.dto';
import { UpdateCommentRequestDto } from '../dto/request/update-comment.dto';
import { GetCommentRequestDto } from '../dto/request/get-comment.dto';
import { DataSource } from 'typeorm';
import { Comment } from '../entity/comment.entity';

@Injectable()
export class CommentService {
  constructor(
    private readonly commentRepository: CommentRepository,
    private readonly feedRepository: FeedRepository,
    private readonly userRepository: UserRepository,
    private readonly dataSource: DataSource,
  ) {}

  private async commentCheck(userInformation: Payload, commentId: number) {
    const commentObj = await this.commentRepository.findOne({
      where: {
        id: commentId,
      },
      relations: ['user'],
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
    const feed = await this.feedRepository.findOneBy({
      id: commentDto.feedId,
    });

    if (!feed) {
      throw new NotFoundException('게시글을 찾을 수 없습니다.');
    }

    const comments = await this.commentRepository.getCommentInformation(
      commentDto.feedId,
    );
    return comments.map((row) => ({
      id: row.id,
      comment: row.comment,
      date: row.date,
      user: {
        id: row.user.id,
        userName: row.user.userName,
        profileImage: row.user.profileImage,
      },
    }));
  }

  async create(userInformation: Payload, commentDto: CreateCommentRequestDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const feed = await this.feedRepository.findOneBy({
        id: commentDto.feedId,
      });
      if (!feed) {
        throw new NotFoundException('존재하지 않는 게시글입니다.');
      }

      const user = await this.userRepository.findOneBy({
        id: userInformation.id,
      });

      if (!user) {
        throw new NotFoundException('존재하지 않는 유저입니다.');
      }

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
    const comment = await this.commentCheck(
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
    await this.commentCheck(userInformation, commentDto.commentId);
    const commentObj = await this.commentRepository.findOneBy({
      id: commentDto.commentId,
    });

    commentObj.comment = commentDto.newComment;
    await this.commentRepository.save(commentObj);
  }
}
