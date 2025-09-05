import { Like } from './../entity/like.entity';
import { DataSource } from 'typeorm';
import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { LikeRepository } from '../repository/like.repository';
import { Payload } from '../../common/guard/jwt.guard';
import { ManageLikeRequestDto } from '../dto/request/manageLike.dto';
import { GetLikeResponseDto } from '../dto/response/getLike.dto';
import { FeedService } from '../../feed/service/feed.service';

@Injectable()
export class LikeService {
  constructor(
    private readonly likeRepository: LikeRepository,
    private readonly feedService: FeedService,
    private readonly dataSource: DataSource,
  ) {}

  async get(userInformation: Payload, feedLikeGetDto: ManageLikeRequestDto) {
    await this.feedService.getFeed(feedLikeGetDto.feedId);
    let isLike = false;

    if (userInformation) {
      const like = await this.likeRepository.findOneBy({
        user: { id: userInformation.id },
        feed: { id: feedLikeGetDto.feedId },
      });
      isLike = !!like;
    }

    return GetLikeResponseDto.toResponseDto(isLike);
  }

  async create(
    userInformation: Payload,
    feedLikeCreateDto: ManageLikeRequestDto,
  ) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const feed = await this.feedService.getFeed(feedLikeCreateDto.feedId);
      const existing = await this.likeRepository.findOneBy({
        user: { id: userInformation.id },
        feed: { id: feedLikeCreateDto.feedId },
      });
      if (existing) {
        throw new ConflictException('이미 좋아요를 눌렀습니다.');
      }

      feed.likeCount++;
      await queryRunner.manager.save(feed);
      await queryRunner.manager.save(Like, {
        user: { id: userInformation.id },
        feed: { id: feedLikeCreateDto.feedId },
      });

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async delete(
    userInformation: Payload,
    feedLikeDeleteDto: ManageLikeRequestDto,
  ) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const feed = await this.feedService.getFeed(feedLikeDeleteDto.feedId);
      const existing = await this.likeRepository.findOneBy({
        user: { id: userInformation.id },
        feed: { id: feedLikeDeleteDto.feedId },
      });
      if (!existing) {
        throw new NotFoundException('좋아요를 누르지 않은 상태입니다.');
      }

      feed.likeCount--;
      await queryRunner.manager.save(feed);
      await queryRunner.manager.delete(Like, {
        user: { id: userInformation.id },
        feed: { id: feedLikeDeleteDto.feedId },
      });

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
