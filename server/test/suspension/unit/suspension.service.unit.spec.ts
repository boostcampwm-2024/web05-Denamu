import { BadRequestException, NotFoundException } from '@nestjs/common';

import { AdminRepository } from '@admin/repository/admin.repository';

import { UserSuspensionRepository } from '@suspension/repository/userSuspension.repository';
import { SuspensionService } from '@suspension/service/suspension.service';

import { UserService } from '@user/service/user.service';

describe(`${SuspensionService.name} Unit Test`, () => {
  let suspensionService: SuspensionService;
  let userSuspensionRepository: {
    manager: { save: jest.Mock };
    updateActiveSuspension: jest.Mock;
    deleteActiveSuspensions: jest.Mock;
  };
  let userService: jest.Mocked<
    Pick<UserService, 'getUser' | 'invalidateUserTokens'>
  >;
  let adminRepository: jest.Mocked<Pick<AdminRepository, 'findOneBy'>>;

  const dto = { userId: 2, detail: '반복적인 스팸으로 인한 정지' };

  beforeEach(() => {
    userSuspensionRepository = {
      manager: { save: jest.fn() },
      updateActiveSuspension: jest.fn(),
      deleteActiveSuspensions: jest.fn(),
    };
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

  describe('updateUserSuspension', () => {
    it('존재하지 않는 유저면 NotFoundException을 던진다.', async () => {
      // given
      userService.getUser.mockRejectedValue(
        new NotFoundException('존재하지 않는 유저입니다.'),
      );

      // when & then
      await expect(
        suspensionService.updateUserSuspension('admin@test.com', 2, {
          detail: '해제 처리',
        }),
      ).rejects.toThrow(NotFoundException);
      expect(
        userSuspensionRepository.updateActiveSuspension,
      ).not.toHaveBeenCalled();
    });

    it('활성 정지 내역이 없으면 NotFoundException을 던진다.', async () => {
      // given
      userService.getUser.mockResolvedValue({ id: 2 } as any);
      adminRepository.findOneBy.mockResolvedValue({ id: 9 } as any);
      userSuspensionRepository.updateActiveSuspension.mockResolvedValue(0);

      // when & then
      await expect(
        suspensionService.updateUserSuspension('admin@test.com', 2, {
          detail: '해제 처리',
        }),
      ).rejects.toThrow(NotFoundException);
      expect(userService.invalidateUserTokens).not.toHaveBeenCalled();
    });

    it('정지 종료 일시를 과거로 지정하면(해제) 토큰을 무효화하지 않는다.', async () => {
      // given
      userService.getUser.mockResolvedValue({ id: 2 } as any);
      adminRepository.findOneBy.mockResolvedValue({ id: 9 } as any);
      userSuspensionRepository.updateActiveSuspension.mockResolvedValue(1);

      // when
      await suspensionService.updateUserSuspension('admin@test.com', 2, {
        detail: '해제 처리',
        suspendedUntil: new Date(Date.now() - 1000).toISOString(),
      });

      // then
      expect(
        userSuspensionRepository.updateActiveSuspension,
      ).toHaveBeenCalledWith(
        2,
        expect.objectContaining({ detail: '해제 처리', adminId: 9 }),
      );
      expect(userService.invalidateUserTokens).not.toHaveBeenCalled();
    });

    it('정지 종료 일시를 미래로 지정하면(기간 연장) 토큰을 무효화한다.', async () => {
      // given
      userService.getUser.mockResolvedValue({ id: 2 } as any);
      adminRepository.findOneBy.mockResolvedValue({ id: 9 } as any);
      userSuspensionRepository.updateActiveSuspension.mockResolvedValue(1);

      // when
      await suspensionService.updateUserSuspension('admin@test.com', 2, {
        detail: '기간 연장',
        suspendedUntil: new Date(Date.now() + 100000).toISOString(),
      });

      // then
      expect(userService.invalidateUserTokens).toHaveBeenCalledWith(2);
    });

    it('정지 종료 일시를 비우면(영구 정지) 토큰을 무효화한다.', async () => {
      // given
      userService.getUser.mockResolvedValue({ id: 2 } as any);
      adminRepository.findOneBy.mockResolvedValue({ id: 9 } as any);
      userSuspensionRepository.updateActiveSuspension.mockResolvedValue(1);

      // when
      await suspensionService.updateUserSuspension('admin@test.com', 2, {
        detail: '영구 정지로 변경',
      });

      // then
      expect(userService.invalidateUserTokens).toHaveBeenCalledWith(2);
    });
  });

  describe('deleteUserSuspension', () => {
    it('존재하지 않는 유저면 NotFoundException을 던진다.', async () => {
      // given
      userService.getUser.mockRejectedValue(
        new NotFoundException('존재하지 않는 유저입니다.'),
      );

      // when & then
      await expect(
        suspensionService.deleteUserSuspension(2),
      ).rejects.toThrow(NotFoundException);
      expect(
        userSuspensionRepository.deleteActiveSuspensions,
      ).not.toHaveBeenCalled();
    });

    it('활성 정지 내역이 없으면 NotFoundException을 던진다.', async () => {
      // given
      userService.getUser.mockResolvedValue({ id: 2 } as any);
      userSuspensionRepository.deleteActiveSuspensions.mockResolvedValue(0);

      // when & then
      await expect(
        suspensionService.deleteUserSuspension(2),
      ).rejects.toThrow(NotFoundException);
    });

    it('활성 정지 내역이 있으면 삭제하고 토큰을 무효화하지 않는다.', async () => {
      // given
      userService.getUser.mockResolvedValue({ id: 2 } as any);
      userSuspensionRepository.deleteActiveSuspensions.mockResolvedValue(1);

      // when
      await suspensionService.deleteUserSuspension(2);

      // then
      expect(
        userSuspensionRepository.deleteActiveSuspensions,
      ).toHaveBeenCalledWith(2);
      expect(userService.invalidateUserTokens).not.toHaveBeenCalled();
    });
  });
});
