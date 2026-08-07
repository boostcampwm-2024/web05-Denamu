import { Not } from 'typeorm';

import { WinstonLoggerService } from '@common/logger/logger.service';

import { UserRepository } from '@user/repository/user.repository';
import { UserScheduler } from '@user/scheduler/user.scheduler';

describe(`${UserScheduler.name} Unit Test`, () => {
  let userScheduler: UserScheduler;
  let userRepository: jest.Mocked<Pick<UserRepository, 'update'>>;
  let logger: jest.Mocked<Pick<WinstonLoggerService, 'log' | 'error'>>;

  beforeEach(() => {
    userRepository = { update: jest.fn() };
    logger = { log: jest.fn(), error: jest.fn() };

    userScheduler = new UserScheduler(
      userRepository as unknown as UserRepository,
      logger as unknown as WinstonLoggerService,
    );
  });

  describe('resetProfileImageChangeCounts', () => {
    it('변경 횟수가 0이 아닌 유저를 전부 0으로 초기화한다.', async () => {
      // given
      userRepository.update.mockResolvedValue({ affected: 3 } as any);

      // when
      await userScheduler.resetProfileImageChangeCounts();

      // then
      expect(userRepository.update).toHaveBeenCalledWith(
        { profileImageChangeCount: Not(0) },
        { profileImageChangeCount: 0 },
      );
      expect(logger.log).toHaveBeenCalledWith(expect.stringContaining('3명'));
    });

    it('affected가 없으면 0명으로 로그를 남긴다.', async () => {
      // given
      userRepository.update.mockResolvedValue({ affected: undefined } as any);

      // when
      await userScheduler.resetProfileImageChangeCounts();

      // then
      expect(logger.log).toHaveBeenCalledWith(expect.stringContaining('0명'));
    });

    it('초기화 중 오류가 발생하면 잡아서 에러로 남기고 전파하지 않는다.', async () => {
      // given
      userRepository.update.mockRejectedValue(new Error('DB down'));

      // when & then
      await expect(
        userScheduler.resetProfileImageChangeCounts(),
      ).resolves.toBeUndefined();
      expect(logger.error).toHaveBeenCalled();
    });
  });
});
