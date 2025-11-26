import { HttpStatus, INestApplication } from '@nestjs/common';
import * as supertest from 'supertest';
import { UserRepository } from '../../../src/user/repository/user.repository';
import { ActivityRepository } from '../../../src/activity/repository/activity.repository';
import { UserFixture } from '../../fixture/user.fixture';
import { ActivityFixture } from '../../fixture/activity.fixture';
import { User } from '../../../src/user/entity/user.entity';
import TestAgent from 'supertest/lib/agent';
import { ReadActivityQueryRequestDto } from '../../../src/activity/dto/request/readActivity.dto';

const URL = '/api/activity';

describe(`GET ${URL}/{userId} E2E Test`, () => {
  let app: INestApplication;
  let user: User;
  let activities: Array<{ activityDate: Date; viewCount: number }>;
  let agent: TestAgent;

  beforeAll(async () => {
    app = global.testApp;
    agent = supertest(app.getHttpServer());
    const userRepository = app.get(UserRepository);
    const activityRepository = app.get(ActivityRepository);
    user = await userRepository.save(UserFixture.createUserFixture());
    activities = Array.from({ length: 5 }).map((_, i) =>
      ActivityFixture.createActivityFixture(
        user,
        { viewCount: (i + 1) * 2 },
        i,
      ),
    );

    await activityRepository.insert(activities);
  });

  it('[404] 존재하지 않는 사용자 ID로 요청할 경우 활동 데이터 조회를 실패한다.', async () => {
    // given
    const requestDto = new ReadActivityQueryRequestDto({
      year: activities[0].activityDate.getFullYear(),
    });

    // when
    const response = await agent
      .get(`${URL}/${Number.MAX_SAFE_INTEGER}`)
      .query(requestDto);

    // then
    const { data } = response.body;
    expect(response.status).toBe(HttpStatus.NOT_FOUND);
    expect(data).toBeUndefined();
  });

  it('[200] 존재하는 사용자의 아이디로 요청할 경우 활동 데이터 조회를 성공한다.', async () => {
    // given
    const userId = user.id;
    const requestDto = new ReadActivityQueryRequestDto({
      year: activities[0].activityDate.getFullYear(),
    });

    // when
    const response = await agent.get(`${URL}/${userId}`).query(requestDto);

    // then
    const { data } = response.body;
    const expectedDailyActivities = activities.map((activity) => ({
      date: activity.activityDate.toISOString().split('T')[0],
      viewCount: activity.viewCount,
    }));
    expect(response.status).toBe(HttpStatus.OK);
    expect(data).toStrictEqual({
      dailyActivities: expectedDailyActivities,
      maxStreak: user.maxStreak,
      currentStreak: user.currentStreak,
      totalViews: user.totalViews,
    });
  });
  it('[200] 다른 연도를 요청할 경우 해당 연도의 활동 데이터 조회를 성공한다.', async () => {
    // given
    const userId = user.id;
    const requestDto = new ReadActivityQueryRequestDto({
      year: activities[0].activityDate.getFullYear() - 1,
    });

    // when
    const response = await agent.get(`${URL}/${userId}`).query(requestDto);

    // then
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
