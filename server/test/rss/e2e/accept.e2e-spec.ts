import { HttpStatus, INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { RssFixture } from '../../fixture/rss.fixture';
import { RedisService } from '../../../src/common/redis/redis.service';
import {
  RssAcceptRepository,
  RssRepository,
} from '../../../src/rss/repository/rss.repository';
import { REDIS_KEYS } from '../../../src/common/redis/redis.constant';
import TestAgent from 'supertest/lib/agent';

describe('POST /api/rss/accept/{rssId} E2E Test', () => {
  let app: INestApplication;
  let agent: TestAgent;
  let rssRepository: RssRepository;
  let rssAcceptRepository: RssAcceptRepository;
  let redisService: RedisService;

  beforeAll(async () => {
    app = global.testApp;
    rssRepository = app.get(RssRepository);
    rssAcceptRepository = app.get(RssAcceptRepository);
    redisService = app.get(RedisService);
  });

  beforeEach(async () => {
    await Promise.all([
      rssRepository.delete({}),
      redisService.set(
        `${REDIS_KEYS.ADMIN_AUTH_KEY}:testSessionId`,
        'test_admin',
      ),
    ]);
  });

  it('[201] 정상적으로 RSS를 승인한다.', async () => {
    // given
    const rss = await rssRepository.save(
      RssFixture.createRssFixture({
        rssUrl: 'https://v2.velog.io/rss/@seok3765',
      }),
    );

    // when
    const response = await agent
      .post(`/api/rss/accept/${rss.id}`)
      .set('Cookie', 'sessionId=testSessionId');

    // then
    expect(response.status).toBe(HttpStatus.CREATED);
  });

  it('[404] 존재하지 않는 rss를 승인할 때', async () => {
    // given
    jest.spyOn(rssRepository, 'findOne').mockResolvedValue(undefined);

    // when
    const response = await agent
      .post(`/api/rss/accept/1`)
      .set('Cookie', 'sessionId=testSessionId');

    // then
    expect(response.status).toBe(HttpStatus.NOT_FOUND);
  });

  it('[401] 유효한 세션이 존재하지 않을 때', async () => {
    // when
    const noCookieResponse = await agent.post(`/api/rss/accept/1`);

    const noSessionResponse = await agent
      .post(`/api/rss/accept/1`)
      .set('Cookie', 'sessionId=invalid');

    // then
    expect(noCookieResponse.status).toBe(HttpStatus.UNAUTHORIZED);
    expect(noSessionResponse.status).toBe(HttpStatus.UNAUTHORIZED);
  });
});
