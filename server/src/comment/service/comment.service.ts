import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CommentRepository } from '../repository/comment.repository';
import { WriteCommentRequestDto } from '../dto/request/write-comment.dto';
import { FeedRepository } from '../../feed/repository/feed.repository';
import { UserRepository } from '../../user/repository/user.repository';
import { Payload } from '../../common/guard/jwt.guard';
import { RemoveCommentRequestDto } from '../dto/request/remove-comment.dto';
import { EditCommentRequestDto } from '../dto/request/edit-comment.dto';

@Injectable()
export class CommentService {
  constructor(
    private readonly commentRepository: CommentRepository,
    private readonly feedRepository: FeedRepository,
    private readonly userRepository: UserRepository,
  ) {}

  async commentCheck(userInformation: Payload, commentId: number) {
    const commentAuthor = await this.commentRepository.findOneBy({
      id: commentId,
    });
    if (userInformation.id !== commentAuthor.user.id) {
      throw new UnauthorizedException('본인이 작성한 댓글이 아닙니다.');
    }
  }

  async create(userInformation: Payload, commentDto: WriteCommentRequestDto) {
    const feed = await this.feedRepository.findOneBy({ id: commentDto.feedId });
    if (!feed) {
      throw new NotFoundException('존재하지 않는 게시글입니다.');
    }

    const user = await this.userRepository.findOneBy({
      id: userInformation.id,
    });
    if (!user) {
      throw new NotFoundException('존재하지 않는 유저입니다.');
    }

    await this.commentRepository.save({
      comment: commentDto.comment,
      date: Date.now(),
      feed: { id: commentDto.feedId },
      user: { id: user.id },
    });
  }

  async remove(commentDto: RemoveCommentRequestDto) {
    await this.feedRepository.delete({
      id: commentDto.commentId,
    });
  }

  async edit(commentDto: EditCommentRequestDto) {
    const commentObj = await this.commentRepository.findOneBy({
      id: commentDto.commentId,
    });

    if (!commentObj) {
      throw new NotFoundException('존재하지 않는 댓글입니다.');
    }

    commentObj.comment = commentDto.newComment;
    await this.commentRepository.save(commentObj);
  }
}
