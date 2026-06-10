import { ConflictException, NotFoundException } from '@nestjs/common';

import { DataSource } from 'typeorm';

import { Payload } from '@common/guard/jwt.guard';

import { FeedService } from '@feed/service/feed.service';

import { GetLikeResponseDto } from '@like/dto/response/getLike.dto';
import { Like } from '@like/entity/like.entity';
import { LikeRepository } from '@like/repository/like.repository';
import { LikeService } from '@like/service/like.service';

describe(`${LikeService.name} Unit Test`, () => {
  let likeService: LikeService;
  let likeRepository: jest.Mocked<Pick<LikeRepository, 'findOneBy'>>;
  let feedService: jest.Mocked<Pick<FeedService, 'getFeed'>>;
  let manager: { save: jest.Mock; delete: jest.Mock };
  let dataSource: jest.Mocked<Pick<DataSource, 'transaction'>>;

  const user: Payload = {
    id: 1,
    email: 'user@test.com',
    userName: 'tester',
    role: 'user',
  };
  const dto = { feedId: 10 };

  beforeEach(() => {
    likeRepository = { findOneBy: jest.fn() };
    feedService = { getFeed: jest.fn() };
    manager = { save: jest.fn(), delete: jest.fn() };
    dataSource = {
      transaction: jest.fn((cb: any) => cb(manager)),
    } as any;

    likeService = new LikeService(
      likeRepository as unknown as LikeRepository,
      feedService as unknown as FeedService,
      dataSource as unknown as DataSource,
    );
  });

  describe('get', () => {
    it('비로그인 사용자는 좋아요 조회 없이 false를 반환한다.', async () => {
      // given
      feedService.getFeed.mockResolvedValue({ id: 10 } as any);

      // when
      const result = await likeService.get(null, dto);

      // then
      expect(likeRepository.findOneBy).not.toHaveBeenCalled();
      expect(result).toEqual(GetLikeResponseDto.toResponseDto(false));
    });

    it('로그인 사용자가 좋아요를 눌렀으면 true를 반환한다.', async () => {
      // given
      feedService.getFeed.mockResolvedValue({ id: 10 } as any);
      likeRepository.findOneBy.mockResolvedValue({ id: 1 } as any);

      // when
      const result = await likeService.get(user, dto);

      // then
      expect(result).toEqual(GetLikeResponseDto.toResponseDto(true));
    });

    it('로그인 사용자가 좋아요를 누르지 않았으면 false를 반환한다.', async () => {
      // given
      feedService.getFeed.mockResolvedValue({ id: 10 } as any);
      likeRepository.findOneBy.mockResolvedValue(null);

      // when
      const result = await likeService.get(user, dto);

      // then
      expect(result).toEqual(GetLikeResponseDto.toResponseDto(false));
    });
  });

  describe('create', () => {
    it('이미 좋아요한 상태면 ConflictException을 던진다.', async () => {
      // given
      feedService.getFeed.mockResolvedValue({ id: 10, likeCount: 0 } as any);
      likeRepository.findOneBy.mockResolvedValue({ id: 1 } as any);

      // when & then
      await expect(likeService.create(user, dto)).rejects.toThrow(
        ConflictException,
      );
      expect(manager.save).not.toHaveBeenCalled();
    });

    it('좋아요 수를 증가시키고 좋아요를 저장한다.', async () => {
      // given
      const feed = { id: 10, likeCount: 2 };
      feedService.getFeed.mockResolvedValue(feed as any);
      likeRepository.findOneBy.mockResolvedValue(null);

      // when
      await likeService.create(user, dto);

      // then
      expect(feed.likeCount).toBe(3);
      expect(manager.save).toHaveBeenCalledWith(feed);
      expect(manager.save).toHaveBeenCalledWith(Like, {
        user: { id: user.id },
        feed: { id: dto.feedId },
      });
    });
  });

  describe('delete', () => {
    it('좋아요하지 않은 상태면 NotFoundException을 던진다.', async () => {
      // given
      feedService.getFeed.mockResolvedValue({ id: 10, likeCount: 1 } as any);
      likeRepository.findOneBy.mockResolvedValue(null);

      // when & then
      await expect(likeService.delete(user, dto)).rejects.toThrow(
        NotFoundException,
      );
      expect(manager.delete).not.toHaveBeenCalled();
    });

    it('좋아요 수를 감소시키고 좋아요를 삭제한다.', async () => {
      // given
      const feed = { id: 10, likeCount: 2 };
      feedService.getFeed.mockResolvedValue(feed as any);
      likeRepository.findOneBy.mockResolvedValue({ id: 1 } as any);

      // when
      await likeService.delete(user, dto);

      // then
      expect(feed.likeCount).toBe(1);
      expect(manager.save).toHaveBeenCalledWith(feed);
      expect(manager.delete).toHaveBeenCalledWith(Like, {
        user: { id: user.id },
        feed: { id: dto.feedId },
      });
    });
  });
});
