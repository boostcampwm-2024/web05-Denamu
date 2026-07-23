import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';

import { Payload } from '@common/guard/jwt.guard';

import { GetBlockedRssResponseDto } from '@block/dto/response/getBlockedRss.dto';
import { GetBlockedUsersResponseDto } from '@block/dto/response/getBlockedUsers.dto';
import { Block } from '@block/entity/block.entity';
import { RssBlock } from '@block/entity/rssBlock.entity';
import { BlockRepository } from '@block/repository/block.repository';
import { RssBlockRepository } from '@block/repository/rssBlock.repository';
import { BlockService } from '@block/service/block.service';

import { RssAcceptRepository } from '@rss/repository/rss.repository';

import { UserService } from '@user/service/user.service';

describe(`${BlockService.name} Unit Test`, () => {
  let blockService: BlockService;
  let blockRepository: jest.Mocked<
    Pick<BlockRepository, 'insert' | 'delete' | 'getBlockedUsers'>
  >;
  let rssBlockRepository: jest.Mocked<
    Pick<RssBlockRepository, 'insert' | 'delete' | 'getBlockedRssList'>
  >;
  let rssAcceptRepository: jest.Mocked<Pick<RssAcceptRepository, 'findOne'>>;
  let userService: jest.Mocked<Pick<UserService, 'getUser'>>;

  const user: Payload = {
    id: 1,
    email: 'user@test.com',
    userName: 'tester',
    role: 'user',
  };
  const dto = { userId: 2 };

  beforeEach(() => {
    blockRepository = {
      insert: jest.fn(),
      delete: jest.fn(),
      getBlockedUsers: jest.fn(),
    };
    rssBlockRepository = {
      insert: jest.fn(),
      delete: jest.fn(),
      getBlockedRssList: jest.fn(),
    };
    rssAcceptRepository = { findOne: jest.fn() };
    userService = { getUser: jest.fn() };

    blockService = new BlockService(
      blockRepository as unknown as BlockRepository,
      rssBlockRepository as unknown as RssBlockRepository,
      rssAcceptRepository as unknown as RssAcceptRepository,
      userService as unknown as UserService,
    );
  });

  describe('create', () => {
    it('자기 자신을 차단하면 BadRequestException을 던진다.', async () => {
      // when & then
      await expect(
        blockService.create(user, { userId: user.id }),
      ).rejects.toThrow(BadRequestException);
      expect(blockRepository.insert).not.toHaveBeenCalled();
    });

    it('차단 대상 유저가 존재하지 않으면 NotFoundException을 던진다.', async () => {
      // given
      userService.getUser.mockRejectedValue(
        new NotFoundException('존재하지 않는 유저입니다.'),
      );

      // when & then
      await expect(blockService.create(user, dto)).rejects.toThrow(
        NotFoundException,
      );
      expect(blockRepository.insert).not.toHaveBeenCalled();
    });

    it('이미 차단한 유저면 ConflictException을 던진다.', async () => {
      // given
      userService.getUser.mockResolvedValue({ id: dto.userId } as any);
      blockRepository.insert.mockRejectedValue({ code: 'ER_DUP_ENTRY' });

      // when & then
      await expect(blockService.create(user, dto)).rejects.toThrow(
        ConflictException,
      );
    });

    it('차단 등록에 성공한다.', async () => {
      // given
      userService.getUser.mockResolvedValue({ id: dto.userId } as any);
      blockRepository.insert.mockResolvedValue(undefined);

      // when
      await blockService.create(user, dto);

      // then
      expect(blockRepository.insert).toHaveBeenCalledWith({
        blocker: { id: user.id },
        blocked: { id: dto.userId },
      });
    });

    it('중복 이외의 DB 오류는 그대로 전파한다.', async () => {
      // given
      userService.getUser.mockResolvedValue({ id: dto.userId } as any);
      const dbError = new Error('connection lost');
      blockRepository.insert.mockRejectedValue(dbError);

      // when & then
      await expect(blockService.create(user, dto)).rejects.toThrow(dbError);
    });
  });

  describe('delete', () => {
    it('차단하지 않은 유저를 해제하면 NotFoundException을 던진다.', async () => {
      // given
      blockRepository.delete.mockResolvedValue({ affected: 0 } as any);

      // when & then
      await expect(blockService.delete(user, dto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('차단 해제에 성공한다.', async () => {
      // given
      blockRepository.delete.mockResolvedValue({ affected: 1 } as any);

      // when
      await blockService.delete(user, dto);

      // then
      expect(blockRepository.delete).toHaveBeenCalledWith({
        blocker: { id: user.id },
        blocked: { id: dto.userId },
      });
    });
  });

  describe('getBlockedUsers', () => {
    it('차단 목록을 응답 DTO 배열로 변환하여 반환한다.', async () => {
      // given
      const blocks = [
        {
          id: 1,
          createdAt: new Date('2025-08-16T12:00:00.000Z'),
          blocked: {
            id: 2,
            userName: '차단된유저',
            profileImage: null,
          },
        },
      ] as Block[];
      blockRepository.getBlockedUsers.mockResolvedValue(blocks);

      // when
      const result = await blockService.getBlockedUsers(user);

      // then
      expect(blockRepository.getBlockedUsers).toHaveBeenCalledWith(user.id);
      expect(result).toStrictEqual(
        GetBlockedUsersResponseDto.toResponseDtoArray(blocks),
      );
      expect(result[0]).toMatchObject({
        userId: 2,
        userName: '차단된유저',
        profileImage: null,
      });
    });
  });

  describe('createRssBlock', () => {
    const rssDto = { rssId: 5 };

    it('차단 대상 RSS가 존재하지 않으면 NotFoundException을 던진다.', async () => {
      // given
      rssAcceptRepository.findOne.mockResolvedValue(null);

      // when & then
      await expect(blockService.createRssBlock(user, rssDto)).rejects.toThrow(
        NotFoundException,
      );
      expect(rssBlockRepository.insert).not.toHaveBeenCalled();
    });

    it('이미 차단한 RSS면 ConflictException을 던진다.', async () => {
      // given
      rssAcceptRepository.findOne.mockResolvedValue({
        id: rssDto.rssId,
      } as any);
      rssBlockRepository.insert.mockRejectedValue({ code: 'ER_DUP_ENTRY' });

      // when & then
      await expect(blockService.createRssBlock(user, rssDto)).rejects.toThrow(
        ConflictException,
      );
    });

    it('RSS 차단 등록에 성공한다.', async () => {
      // given
      rssAcceptRepository.findOne.mockResolvedValue({
        id: rssDto.rssId,
      } as any);
      rssBlockRepository.insert.mockResolvedValue(undefined);

      // when
      await blockService.createRssBlock(user, rssDto);

      // then
      expect(rssBlockRepository.insert).toHaveBeenCalledWith({
        blocker: { id: user.id },
        blockedRss: { id: rssDto.rssId },
      });
    });

    it('중복 이외의 DB 오류는 그대로 전파한다.', async () => {
      // given
      rssAcceptRepository.findOne.mockResolvedValue({
        id: rssDto.rssId,
      } as any);
      const dbError = new Error('connection lost');
      rssBlockRepository.insert.mockRejectedValue(dbError);

      // when & then
      await expect(blockService.createRssBlock(user, rssDto)).rejects.toThrow(
        dbError,
      );
    });
  });

  describe('deleteRssBlock', () => {
    const rssDto = { rssId: 5 };

    it('차단하지 않은 RSS를 해제하면 NotFoundException을 던진다.', async () => {
      // given
      rssBlockRepository.delete.mockResolvedValue({ affected: 0 } as any);

      // when & then
      await expect(blockService.deleteRssBlock(user, rssDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('RSS 차단 해제에 성공한다.', async () => {
      // given
      rssBlockRepository.delete.mockResolvedValue({ affected: 1 } as any);

      // when
      await blockService.deleteRssBlock(user, rssDto);

      // then
      expect(rssBlockRepository.delete).toHaveBeenCalledWith({
        blocker: { id: user.id },
        blockedRss: { id: rssDto.rssId },
      });
    });
  });

  describe('getBlockedRssList', () => {
    it('RSS 차단 목록을 응답 DTO 배열로 변환하여 반환한다.', async () => {
      // given
      const rssBlocks = [
        {
          id: 1,
          createdAt: new Date('2025-08-16T12:00:00.000Z'),
          blockedRss: {
            id: 5,
            name: '차단된블로그',
            blogPlatform: 'velog',
          },
        },
      ] as RssBlock[];
      rssBlockRepository.getBlockedRssList.mockResolvedValue(rssBlocks);

      // when
      const result = await blockService.getBlockedRssList(user);

      // then
      expect(rssBlockRepository.getBlockedRssList).toHaveBeenCalledWith(
        user.id,
      );
      expect(result).toStrictEqual(
        GetBlockedRssResponseDto.toResponseDtoArray(rssBlocks),
      );
      expect(result[0]).toMatchObject({
        rssId: 5,
        name: '차단된블로그',
        blogPlatform: 'velog',
      });
    });
  });
});
