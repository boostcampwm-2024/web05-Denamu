import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { UserRepository } from '../../../src/user/repository/user.repository';
import { ActivityRepository } from '../../../src/activity/repository/activity.repository';
import { UserFixture } from '../../fixture/user.fixture';
import { User } from '../../../src/user/entity/user.entity';
import { Activity } from '../../../src/activity/entity/activity.entity';

describe('GET /api/activity/:userId E2E Test', () => {
  let app: INestApplication;
  let userRepository: UserRepository;
  let activityRepository: ActivityRepository;
  let testUser: User;

  beforeAll(async () => {
    app = global.testApp;
    userRepository = app.get(UserRepository);
    activityRepository = app.get(ActivityRepository);

    testUser = await userRepository.save(
      await UserFixture.createUserCryptFixture({
        maxStreak: 15,
        currentStreak: 7,
        totalViews: 120,
      }),
    );

    const activities = [
      {
        user: testUser,
        activityDate: new Date('2024-01-15'),
        viewCount: 5,
      },
      {
        user: testUser,
        activityDate: new Date('2024-01-16'),
        viewCount: 3,
      },
      {
        user: testUser,
        activityDate: new Date('2024-06-01'),
        viewCount: 8,
      },
      {
        user: testUser,
        activityDate: new Date('2024-12-25'),
        viewCount: 2,
      },
    ];

    await activityRepository.save(activities);
  });

  it('존재하는 사용자의 활동 데이터를 정상적으로 조회한다.', async () => {
    // given
    const userId = testUser.id;
    const year = 2024;

    // when
    const response = await request(app.getHttpServer())
      .get(`/api/activity/${userId}`)
      .query({ year });

    // then
    expect(response.status).toBe(200);
    expect(response.body.message).toBe('요청이 성공적으로 처리되었습니다.');

    const { data } = response.body;
    expect(data.maxStreak).toBe(15);
    expect(data.currentStreak).toBe(7);
    expect(data.totalViews).toBe(120);

    expect(data.dailyActivities).toHaveLength(4);
    expect(data.dailyActivities).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          date: '2024-01-15',
          viewCount: 5,
        }),
        expect.objectContaining({
          date: '2024-01-16',
          viewCount: 3,
        }),
        expect.objectContaining({
          date: '2024-06-01',
          viewCount: 8,
        }),
        expect.objectContaining({
          date: '2024-12-25',
          viewCount: 2,
        }),
      ]),
    );
  });

  it('다른 연도를 요청하면 해당 연도의 데이터만 조회된다.', async () => {
    // given
    const userId = testUser.id;
    const year = 2023;

    // when
    const response = await request(app.getHttpServer())
      .get(`/api/activity/${userId}`)
      .query({ year });

    // then
    expect(response.status).toBe(200);
    expect(response.body.message).toBe('요청이 성공적으로 처리되었습니다.');

    const { data } = response.body;
    expect(data.maxStreak).toBe(15);
    expect(data.currentStreak).toBe(7);
    expect(data.totalViews).toBe(120);
    expect(data.dailyActivities).toHaveLength(0);
  });

  it('존재하지 않는 사용자 ID로 요청하면 404 에러를 반환한다.', async () => {
    // given
    const nonExistentUserId = 99999;
    const year = 2024;

    // when
    const response = await request(app.getHttpServer())
      .get(`/api/activity/${nonExistentUserId}`)
      .query({ year });

    // then
    expect(response.status).toBe(404);
    expect(response.body.message).toBe('존재하지 않는 사용자입니다.');
  });
});
