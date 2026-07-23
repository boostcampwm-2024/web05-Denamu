import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';

import { Payload } from '@common/guard/jwt.guard';

import { GetBlockedUsersResponseDto } from '@block/dto/response/getBlockedUsers.dto';
import { Block } from '@block/entity/block.entity';
import { BlockRepository } from '@block/repository/block.repository';
import { BlockService } from '@block/service/block.service';

import { UserService } from '@user/service/user.service';

describe(`${BlockService.name} Unit Test`, () => {
  let blockService: BlockService;
  let blockRepository: jest.Mocked<
    Pick<BlockRepository, 'insert' | 'delete' | 'getBlockedUsers'>
  >;
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
    userService = { getUser: jest.fn() };

    blockService = new BlockService(
      blockRepository as unknown as BlockRepository,
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
});
