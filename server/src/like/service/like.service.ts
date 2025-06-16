import { Like } from './../entity/like.entity';
import { DataSource } from 'typeorm';
import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { LikeRepository } from '../repository/like.repository';
import { Payload } from '../../common/guard/jwt.guard';
import { FeedRepository } from '../../feed/repository/feed.repository';
import { FeedLikeRequestDto } from '../dto/request/like.dto';

@Injectable()
export class LikeService {
  constructor(
    private readonly likeRepository: LikeRepository,
    private readonly feedRepository: FeedRepository,
    private readonly dataSource: DataSource,
  ) {}

  async create(
    userInformation: Payload,
    feedLikeCreateDto: FeedLikeRequestDto,
  ) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const feed = await this.feedRepository.findOneBy({
        id: feedLikeCreateDto.feedId,
      });
      if (!feed) {
        throw new NotFoundException('해당 피드를 찾을 수 없습니다.');
      }

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
    feedLikeDeleteDto: FeedLikeRequestDto,
  ) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const feed = await this.feedRepository.findOneBy({
        id: feedLikeDeleteDto.feedId,
      });
      if (!feed) {
        throw new NotFoundException('해당 피드를 찾을 수 없습니다.');
      }

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
