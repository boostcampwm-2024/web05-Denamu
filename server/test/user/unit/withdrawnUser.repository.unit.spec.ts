import { DataSource } from 'typeorm';

import { WithdrawnUserRepository } from '@user/repository/withdrawnUser.repository';

describe(`${WithdrawnUserRepository.name} Unit Test`, () => {
  let withdrawnUserRepository: WithdrawnUserRepository;

  beforeEach(() => {
    const dataSource = {
      createEntityManager: jest.fn(),
    } as unknown as DataSource;

    withdrawnUserRepository = new WithdrawnUserRepository(dataSource);
  });

  describe('getRejoinAvailableAt', () => {
    it('탈퇴 기록이 없으면 null을 반환한다.', async () => {
      // given
      jest.spyOn(withdrawnUserRepository, 'findOne').mockResolvedValue(null);

      // when
      const result =
        await withdrawnUserRepository.getRejoinAvailableAt('none@test.com');

      // then
      expect(result).toBeNull();
    });

    it('탈퇴 후 3개월이 지나지 않았으면 재가입 가능 시각을 반환한다.', async () => {
      // given
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
      jest.spyOn(withdrawnUserRepository, 'findOne').mockResolvedValue({
        id: 1,
        email: 'restricted@test.com',
        withdrawnAt: oneMonthAgo,
      });

      // when
      const result = await withdrawnUserRepository.getRejoinAvailableAt(
        'restricted@test.com',
      );

      // then
      const expectedAvailableAt = new Date(oneMonthAgo);
      expectedAvailableAt.setMonth(expectedAvailableAt.getMonth() + 3);
      expect(result).toEqual(expectedAvailableAt);
    });

    it('탈퇴 후 3개월이 지났으면 null을 반환한다.', async () => {
      // given
      const fourMonthsAgo = new Date();
      fourMonthsAgo.setMonth(fourMonthsAgo.getMonth() - 4);
      jest.spyOn(withdrawnUserRepository, 'findOne').mockResolvedValue({
        id: 1,
        email: 'expired@test.com',
        withdrawnAt: fourMonthsAgo,
      });

      // when
      const result =
        await withdrawnUserRepository.getRejoinAvailableAt('expired@test.com');

      // then
      expect(result).toBeNull();
    });
  });
});
