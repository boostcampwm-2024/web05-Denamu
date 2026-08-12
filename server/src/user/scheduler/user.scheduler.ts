import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

import { LessThanOrEqual, Not } from 'typeorm';

import { WinstonLoggerService } from '@common/logger/logger.service';

import { REJOIN_RESTRICTION_MONTHS } from '@user/constant/user.constants';
import { UserRepository } from '@user/repository/user.repository';
import { WithdrawnUserRepository } from '@user/repository/withdrawnUser.repository';

@Injectable()
export class UserScheduler {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly withdrawnUserRepository: WithdrawnUserRepository,
    private readonly logger: WinstonLoggerService,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async resetExpiredStreaks() {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);

    try {
      const expiredUsers = await this.userRepository.find({
        where: {
          currentStreak: Not(0),
          lastActiveDate: Not(null),
        },
      });

      const usersToUpdate = expiredUsers.filter((user) => {
        if (!user.lastActiveDate) return false;

        const lastActive = new Date(user.lastActiveDate);
        lastActive.setHours(0, 0, 0, 0);

        return lastActive < yesterday;
      });

      if (usersToUpdate.length > 0) {
        await this.userRepository.update(
          usersToUpdate.map((user) => user.id),
          { currentStreak: 0 },
        );

        this.logger.log(
          `[UserScheduler]: ${usersToUpdate.length} 명의 streak 정보 업데이트 완료.`,
        );
      } else {
        this.logger.log('[UserScheduler]: streak 업데이트 된 사용자 없음.');
      }
    } catch (error) {
      this.logger.error(
        `[UserScheduler]: streak 업데이트 스케줄러 동작중 오류 발생: ${error}`,
      );
    }
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async resetProfileImageChangeCounts() {
    try {
      const result = await this.userRepository.update(
        { profileImageChangeCount: Not(0) },
        { profileImageChangeCount: 0 },
      );
      this.logger.log(
        `[UserScheduler]: 프로필 이미지 변경 횟수 초기화 완료. ${result.affected ?? 0}명.`,
      );
    } catch (error) {
      this.logger.error(
        `[UserScheduler]: 프로필 이미지 변경 횟수 초기화 중 오류 발생: ${error}`,
      );
    }
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async purgeExpiredWithdrawnUsers() {
    const threshold = new Date();
    threshold.setMonth(threshold.getMonth() - REJOIN_RESTRICTION_MONTHS);

    try {
      const result = await this.withdrawnUserRepository.delete({
        withdrawnAt: LessThanOrEqual(threshold),
      });

      this.logger.log(
        `[UserScheduler]: 재가입 제한 만료 기록 ${result.affected ?? 0}건 파기 완료.`,
      );
    } catch (error) {
      this.logger.error(
        `[UserScheduler]: 재가입 제한 기록 파기 중 오류 발생: ${error}`,
      );
    }
  }
}
