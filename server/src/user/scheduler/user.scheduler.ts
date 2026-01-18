import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

import { Not } from 'typeorm';

import { WinstonLoggerService } from '@common/logger/logger.service';

import { UserRepository } from '@user/repository/user.repository';

@Injectable()
export class UserScheduler {
  constructor(
    private readonly userRepository: UserRepository,
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
        await this.userRepository
          .createQueryBuilder()
          .update()
          .set({ currentStreak: 0 })
          .whereInIds(usersToUpdate.map((user) => user.id))
          .execute();

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
}
