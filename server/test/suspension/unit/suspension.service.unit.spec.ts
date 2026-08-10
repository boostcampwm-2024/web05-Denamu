import { BadRequestException, NotFoundException } from '@nestjs/common';

import { AdminRepository } from '@admin/repository/admin.repository';

import { UserSuspensionRepository } from '@suspension/repository/userSuspension.repository';
import { SuspensionService } from '@suspension/service/suspension.service';

import { UserService } from '@user/service/user.service';

describe(`${SuspensionService.name} Unit Test`, () => {
  let suspensionService: SuspensionService;
  let userSuspensionRepository: { manager: { save: jest.Mock } };
  let userService: jest.Mocked<
    Pick<UserService, 'getUser' | 'invalidateUserTokens'>
  >;
  let adminRepository: jest.Mocked<Pick<AdminRepository, 'findOneBy'>>;

  const dto = { userId: 2, detail: '반복적인 스팸으로 인한 정지' };

  beforeEach(() => {
    userSuspensionRepository = { manager: { save: jest.fn() } };
    userService = {
      getUser: jest.fn(),
      invalidateUserTokens: jest.fn(),
    };
    adminRepository = { findOneBy: jest.fn() };

    suspensionService = new SuspensionService(
      userSuspensionRepository as unknown as UserSuspensionRepository,
      userService as unknown as UserService,
      adminRepository as unknown as AdminRepository,
    );
  });

  describe('createUserSuspension', () => {
    it('존재하지 않는 유저면 NotFoundException을 던진다.', async () => {
      // given
      userService.getUser.mockRejectedValue(
        new NotFoundException('존재하지 않는 유저입니다.'),
      );

      // when & then
      await expect(
        suspensionService.createUserSuspension('admin@test.com', dto),
      ).rejects.toThrow(NotFoundException);
      expect(userSuspensionRepository.manager.save).not.toHaveBeenCalled();
    });

    it('정지 종료 일시가 과거면 BadRequestException을 던진다.', async () => {
      // given
      userService.getUser.mockResolvedValue({ id: 2 } as any);

      // when & then
      await expect(
        suspensionService.createUserSuspension('admin@test.com', {
          ...dto,
          suspendedUntil: new Date(Date.now() - 1000).toISOString(),
        }),
      ).rejects.toThrow(BadRequestException);
      expect(userSuspensionRepository.manager.save).not.toHaveBeenCalled();
    });

    it('관리자를 찾으면 admin 정보와 함께 정지를 생성한다.', async () => {
      // given
      userService.getUser.mockResolvedValue({ id: 2 } as any);
      adminRepository.findOneBy.mockResolvedValue({ id: 9 } as any);

      // when
      await suspensionService.createUserSuspension('admin@test.com', dto);

      // then
      expect(userSuspensionRepository.manager.save).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          user: { id: 2 },
          admin: { id: 9 },
          detail: dto.detail,
          suspendedUntil: null,
        }),
      );
    });

    it('관리자를 찾지 못하면 admin null로 정지를 생성한다.', async () => {
      // given
      userService.getUser.mockResolvedValue({ id: 2 } as any);
      adminRepository.findOneBy.mockResolvedValue(null);

      // when
      await suspensionService.createUserSuspension('admin@test.com', dto);

      // then
      expect(userSuspensionRepository.manager.save).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          user: { id: 2 },
          admin: null,
          detail: dto.detail,
        }),
      );
    });
  });
});
