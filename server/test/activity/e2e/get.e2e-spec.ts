import { HttpStatus, INestApplication } from '@nestjs/common';
import * as supertest from 'supertest';
import { UserRepository } from '../../../src/user/repository/user.repository';
import { ActivityRepository } from '../../../src/activity/repository/activity.repository';
import { UserFixture } from '../../fixture/user.fixture';
import { ActivityFixture } from '../../fixture/activity.fixture';
import { User } from '../../../src/user/entity/user.entity';
import TestAgent from 'supertest/lib/agent';
import { ReadActivityQueryRequestDto } from '../../../src/activity/dto/request/readActivity.dto';
import { ReadActivityResponseDto } from '../../../src/activity/dto/response/readActivity.dto';

describe('GET /api/activity/{userId} E2E Test', () => {
  let app: INestApplication;
  let user: User;
  let activityData: Array<{ activityDate: Date; viewCount: number }>;
  let agent: TestAgent;

  beforeAll(async () => {
    app = global.testApp;
    agent = supertest(app.getHttpServer());
    const userRepository = app.get(UserRepository);
    const activityRepository = app.get(ActivityRepository);

    user = await userRepository.save(UserFixture.createUserFixture());

    activityData = [
      { activityDate: new Date('2024-01-15'), viewCount: 5 },
      { activityDate: new Date('2024-01-16'), viewCount: 3 },
      { activityDate: new Date('2024-06-01'), viewCount: 8 },
      { activityDate: new Date('2024-12-25'), viewCount: 2 },
    ];

    const activities = ActivityFixture.createMultipleActivitiesFixture(
      user,
      activityData,
    );

    await activityRepository.save(activities);
  });

  it('[404] 존재하지 않는 사용자 ID로 요청할 경우 활동 데이터 조회를 실패한다.', async () => {
    // given
    const requestDto = new ReadActivityQueryRequestDto({
      year: activityData[0].activityDate.getFullYear(),
    });

    // when
    const response = await agent
      .get(`/api/activity/${Number.MAX_SAFE_INTEGER}`)
      .query(requestDto);

    // then
    expect(response.status).toBe(HttpStatus.NOT_FOUND);
  });

  it('[200] 존재하는 사용자의 아이디로 요청할 경우 활동 데이터 조회를 성공한다.', async () => {
    // given
    const userId = user.id;
    const requestDto = new ReadActivityQueryRequestDto({
      year: activityData[0].activityDate.getFullYear(),
    });

    // when
    const response = await agent
      .get(`/api/activity/${userId}`)
      .query(requestDto);

    // then
    const { data } = response.body;
    expect(response.status).toBe(HttpStatus.OK);
    expect(data).toStrictEqual({
      ...ReadActivityResponseDto.toResponseDto(
        activityData.map((activity) => ({
          date: activity.activityDate.toISOString().split('T')[0],
          viewCount: activity.viewCount,
        })),
        user,
      ),
    });
  });

  it('[200] 다른 연도를 요청할 경우 해당 연도의 활동 데이터 조회를 성공한다.', async () => {
    // given
    const userId = user.id;
    const requestDto = new ReadActivityQueryRequestDto({
      year: activityData[0].activityDate.getFullYear() - 1,
    });

    // when
    const response = await agent
      .get(`/api/activity/${userId}`)
      .query(requestDto);

    // then
    const { data } = response.body;
    expect(response.status).toBe(HttpStatus.OK);
    expect(data).toStrictEqual({
      ...ReadActivityResponseDto.toResponseDto([], user),
    });
  });
});
