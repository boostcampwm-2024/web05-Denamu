import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { ActivityRepository } from '@activity/repository/activity.repository';
import { ActivityService } from '@activity/service/activity.service';

import { User } from '@user/entity/user.entity';
import { UserService } from '@user/service/user.service';

import { ActivityFixture } from '@test/config/common/fixture/activity.fixture';
import { UserFixture } from '@test/config/common/fixture/user.fixture';

describe(`${ActivityService.name} Unit Test`, () => {
  let activityService: ActivityService;
  let activityRepository: jest.Mocked<
    Pick<ActivityRepository, 'upsertByUserId' | 'findActivitiesByUserIdAndYear'>
  >;
  let userService: jest.Mocked<Pick<UserService, 'getUser'>>;

  beforeEach(async () => {
    activityRepository = {
      upsertByUserId: jest.fn(),
      findActivitiesByUserIdAndYear: jest.fn(),
    };
    userService = {
      getUser: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ActivityService,
        { provide: ActivityRepository, useValue: activityRepository },
        { provide: UserService, useValue: userService },
      ],
    }).compile();

    activityService = module.get(ActivityService);
  });

  describe('readActivities', () => {
    let user: User;
    const userId = 1;
    const year = 2024;

    beforeEach(() => {
      user = UserFixture.createUserFixture();
      userService.getUser.mockResolvedValue(user);
    });

    it('조회된 활동을 날짜별 DTO로 매핑하고 사용자 스트릭 정보와 함께 반환한다.', async () => {
      // given
      const activities = ActivityFixture.createActivitiesFixture(user, 3);
      activityRepository.findActivitiesByUserIdAndYear.mockResolvedValue(
        activities,
      );

      // when
      const result = await activityService.readActivities(userId, year);

      // then
      expect(result).toEqual({
        dailyActivities: activities.map((activity) => ({
          date: activity.activityDate.toISOString().split('T')[0],
          viewCount: activity.viewCount,
        })),
        maxStreak: user.maxStreak,
        currentStreak: user.currentStreak,
        totalViews: user.totalViews,
      });
    });

    it('userId와 year를 그대로 의존성에 위임한다.', async () => {
      // given
      activityRepository.findActivitiesByUserIdAndYear.mockResolvedValue([]);

      // when
      await activityService.readActivities(userId, year);

      // then
      expect(userService.getUser).toHaveBeenCalledWith(userId);
      expect(
        activityRepository.findActivitiesByUserIdAndYear,
      ).toHaveBeenCalledWith(userId, year);
    });

    it('활동이 없으면 빈 배열을 반환한다.', async () => {
      // given
      activityRepository.findActivitiesByUserIdAndYear.mockResolvedValue([]);

      // when
      const result = await activityService.readActivities(userId, year);

      // then
      expect(result.dailyActivities).toStrictEqual([]);
    });

    it('존재하지 않는 사용자면 NotFoundException을 전파하고 활동을 조회하지 않는다.', async () => {
      // given
      userService.getUser.mockRejectedValue(
        new NotFoundException('존재하지 않는 유저입니다.'),
      );

      // when & then
      await expect(
        activityService.readActivities(userId, year),
      ).rejects.toThrow(NotFoundException);
      expect(
        activityRepository.findActivitiesByUserIdAndYear,
      ).not.toHaveBeenCalled();
    });
  });

  describe('upsertActivity', () => {
    it('userId로 활동 upsert를 위임한다.', async () => {
      // given
      const userId = 1;
      activityRepository.upsertByUserId.mockResolvedValue();

      // when
      await activityService.upsertActivity(userId);

      // then
      expect(activityRepository.upsertByUserId).toHaveBeenCalledWith(userId);
    });
  });
});
