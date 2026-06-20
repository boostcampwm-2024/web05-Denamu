import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { DataSource } from 'typeorm';

import { Payload } from '@common/guard/jwt.guard';

import { FeedService } from '@feed/service/feed.service';

import { GetUserLikesRequestDto } from '@like/dto/request/getUserLikes.dto';
import { ManageLikeRequestDto } from '@like/dto/request/manageLike.dto';
import { GetLikeResponseDto } from '@like/dto/response/getLike.dto';
import { GetUserLikesResponseDto } from '@like/dto/response/getUserLikes.dto';
import { Like } from '@like/entity/like.entity';
import { LikeRepository } from '@like/repository/like.repository';

import { UserService } from '@user/service/user.service';

@Injectable()
export class LikeService {
  constructor(
    private readonly likeRepository: LikeRepository,
    private readonly feedService: FeedService,
    private readonly dataSource: DataSource,
    private readonly userService: UserService,
  ) {}

  async getLikesByUser(userId: number, likeDto: GetUserLikesRequestDto) {
    await this.userService.getUser(userId);

    const likes = await this.likeRepository.getLikesByUser(
      userId,
      likeDto.lastId,
      likeDto.limit,
    );

    const hasMore = likes.length > likeDto.limit;
    if (hasMore) likes.pop();
    const lastId = likes.length ? likes[likes.length - 1].id : 0;

    return GetUserLikesResponseDto.toResponseDto(likes, lastId, hasMore);
  }

  async get(
    userInformation: Payload | null,
    feedLikeGetDto: ManageLikeRequestDto,
  ) {
    await this.feedService.getPublicFeed(feedLikeGetDto.feedId);
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
    await this.dataSource.transaction(async (manager) => {
      const feed = await this.feedService.getPublicFeed(feedLikeCreateDto.feedId);
      const existing = await this.likeRepository.findOneBy({
        user: { id: userInformation.id },
        feed,
      });
      if (existing) {
        throw new ConflictException('이미 좋아요를 눌렀습니다.');
      }

      feed.likeCount++;
      await manager.save(feed);
      await manager.save(Like, {
        user: { id: userInformation.id },
        feed: { id: feedLikeCreateDto.feedId },
      });
    });
  }

  async delete(
    userInformation: Payload,
    feedLikeDeleteDto: ManageLikeRequestDto,
  ) {
    await this.dataSource.transaction(async (manager) => {
      const feed = await this.feedService.getFeed(feedLikeDeleteDto.feedId);
      const existing = await this.likeRepository.findOneBy({
        user: { id: userInformation.id },
        feed,
      });
      if (!existing) {
        throw new NotFoundException('좋아요를 누르지 않은 상태입니다.');
      }

      feed.likeCount--;
      await manager.save(feed);
      await manager.delete(Like, {
        user: { id: userInformation.id },
        feed: { id: feedLikeDeleteDto.feedId },
      });
    });
  }
}
