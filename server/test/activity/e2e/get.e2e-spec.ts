import { HttpStatus } from '@nestjs/common';
import supertest from 'supertest';
import { UserRepository } from '@src/user/repository/user.repository';
import { ActivityRepository } from '@src/activity/repository/activity.repository';
import { UserFixture } from '@test/config/common/fixture/user.fixture';
import { ActivityFixture } from '@test/config/common/fixture/activity.fixture';
import { User } from '@src/user/entity/user.entity';
import TestAgent from 'supertest/lib/agent';
import { ReadActivityQueryRequestDto } from '@src/activity/dto/request/readActivity.dto';
import { Activity } from '@src/activity/entity/activity.entity';
import { testApp } from '@test/config/e2e/env/jest.setup';

const URL = '/api/activity';

describe(`GET ${URL}/{userId} E2E Test`, () => {
  let user: User;
  let activities: Activity[];
  let agent: TestAgent;
  let activityRepository: ActivityRepository;
  let userRepository: UserRepository;

  beforeAll(() => {
    agent = supertest(testApp.getHttpServer());
    activityRepository = testApp.get(ActivityRepository);
    userRepository = testApp.get(UserRepository);
  });

  beforeEach(async () => {
    user = await userRepository.save(
      await UserFixture.createUserCryptFixture(),
    );
    activities = await activityRepository.save(
      ActivityFixture.createActivitiesFixture(user, 3),
    );
  });

  it('[404] 존재하지 않는 사용자 ID로 요청할 경우 활동 데이터 조회를 실패한다.', async () => {
    // given
    const requestDto = new ReadActivityQueryRequestDto({
      year: activities[0].activityDate.getFullYear(),
    });

    // Http when
    const response = await agent
      .get(`${URL}/${Number.MAX_SAFE_INTEGER}`)
      .query(requestDto);

    // Http then
    const { data } = response.body;
    expect(response.status).toBe(HttpStatus.NOT_FOUND);
    expect(data).toBeUndefined();
  });

  it('[200] 존재하는 사용자의 아이디로 요청할 경우 활동 데이터 조회를 성공한다.', async () => {
    // given
    const requestDto = new ReadActivityQueryRequestDto({
      year: activities[0].activityDate.getFullYear(),
    });

    // Http when
    const response = await agent.get(`${URL}/${user.id}`).query(requestDto);

    // Http then
    const { data } = response.body;
    expect(response.status).toBe(HttpStatus.OK);
    expect(data).toStrictEqual({
      dailyActivities: activities.map((activity) => ({
        date: activity.activityDate.toISOString().split('T')[0],
        viewCount: activity.viewCount,
      })),
      maxStreak: user.maxStreak,
      currentStreak: user.currentStreak,
      totalViews: user.totalViews,
    });
  });

  it('[200] 다른 연도를 요청할 경우 해당 연도의 활동 데이터 조회를 성공한다.', async () => {
    // given
    const requestDto = new ReadActivityQueryRequestDto({
      year: activities[0].activityDate.getFullYear() - 1,
    });

    // Http when
    const response = await agent.get(`${URL}/${user.id}`).query(requestDto);

    // Http then
    const { data } = response.body;
    expect(response.status).toBe(HttpStatus.OK);
    expect(data).toStrictEqual({
      dailyActivities: [],
      maxStreak: user.maxStreak,
      currentStreak: user.currentStreak,
      totalViews: user.totalViews,
    });
  });
});
