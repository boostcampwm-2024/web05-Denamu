import { HttpStatus, INestApplication } from '@nestjs/common';
import * as supertest from 'supertest';
import { UserRepository } from '../../../src/user/repository/user.repository';
import { ActivityRepository } from '../../../src/activity/repository/activity.repository';
import { UserFixture } from '../../fixture/user.fixture';
import { ActivityFixture } from '../../fixture/activity.fixture';
import { User } from '../../../src/user/entity/user.entity';
import TestAgent from 'supertest/lib/agent';
import { ReadActivityQueryRequestDto } from '../../../src/activity/dto/request/readActivity.dto';

describe('GET /api/activity/{userId} E2E Test', () => {
  let app: INestApplication;
  let testUser: User;
  let activitiesData: Array<{ activityDate: Date; viewCount: number }>;
  let agent: TestAgent;

  beforeAll(async () => {
    app = global.testApp;
    agent = supertest(app.getHttpServer());
    const userRepository = app.get(UserRepository);
    const activityRepository = app.get(ActivityRepository);

    testUser = await userRepository.save(UserFixture.createUserFixture());

    activitiesData = [
      { activityDate: new Date('2024-01-15'), viewCount: 5 },
      { activityDate: new Date('2024-01-16'), viewCount: 3 },
      { activityDate: new Date('2024-06-01'), viewCount: 8 },
      { activityDate: new Date('2024-12-25'), viewCount: 2 },
    ];

    const activities = ActivityFixture.createMultipleActivitiesFixture(
      testUser,
      activitiesData,
    );

    await activityRepository.save(activities);
  });

  it('[200] 존재하는 사용자의 활동 데이터를 정상적으로 조회한다.', async () => {
    // given
    const userId = testUser.id;
    const requestDto = new ReadActivityQueryRequestDto({
      year: activitiesData[0].activityDate.getFullYear(),
    });

    // when
    const response = await agent
      .get(`/api/activity/${userId}`)
      .query(requestDto);

    // then
    expect(response.status).toBe(HttpStatus.OK);
    expect(response.body.message).toBe('요청이 성공적으로 처리되었습니다.');

    const { data } = response.body;
    expect(data.maxStreak).toBe(testUser.maxStreak);
    expect(data.currentStreak).toBe(testUser.currentStreak);
    expect(data.totalViews).toBe(testUser.totalViews);

    expect(data.dailyActivities).toHaveLength(activitiesData.length);
    expect(data.dailyActivities).toEqual(
      expect.arrayContaining(
        activitiesData.map((activity) =>
          expect.objectContaining({
            date: activity.activityDate.toISOString().split('T')[0],
            viewCount: activity.viewCount,
          }),
        ),
      ),
    );
  });

  it('[200] 다른 연도를 요청하면 해당 연도의 데이터만 조회된다.', async () => {
    // given
    const userId = testUser.id;
    const requestDto = new ReadActivityQueryRequestDto({
      year: activitiesData[0].activityDate.getFullYear() - 1,
    });

    // when
    const response = await agent
      .get(`/api/activity/${userId}`)
      .query(requestDto);

    // then
    expect(response.status).toBe(HttpStatus.OK);
    expect(response.body.message).toBe('요청이 성공적으로 처리되었습니다.');

    const { data } = response.body;
    expect(data.maxStreak).toBe(testUser.maxStreak);
    expect(data.currentStreak).toBe(testUser.currentStreak);
    expect(data.totalViews).toBe(testUser.totalViews);
    expect(data.dailyActivities).toHaveLength(0);
  });

  it('[404] 존재하지 않는 사용자 ID로 요청하면 404 에러를 반환한다.', async () => {
    // given
    const requestDto = new ReadActivityQueryRequestDto({
      year: activitiesData[0].activityDate.getFullYear(),
    });

    // when
    const response = await agent
      .get(`/api/activity/${Number.MAX_SAFE_INTEGER}`)
      .query(requestDto);

    // then
    expect(response.status).toBe(HttpStatus.NOT_FOUND);
  });
});
