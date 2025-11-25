import { HttpStatus, INestApplication } from '@nestjs/common';
import * as supertest from 'supertest';
import { RssFixture } from '../../fixture/rss.fixture';
import {
  RssAcceptRepository,
  RssRepository,
} from '../../../src/rss/repository/rss.repository';
import TestAgent from 'supertest/lib/agent';
import { RedisService } from '../../../src/common/redis/redis.service';
import { REDIS_KEYS } from '../../../src/common/redis/redis.constant';

const URL = '/api/rss';

describe(`GET ${URL} E2E Test`, () => {
  let app: INestApplication;
  let agent: TestAgent;
  let rssRepository: RssRepository;
  let rssAcceptRepository: RssAcceptRepository;
  let redisService: RedisService;

  beforeAll(() => {
    app = global.testApp;
    agent = supertest(app.getHttpServer());
    rssRepository = app.get(RssRepository);
    rssAcceptRepository = app.get(RssAcceptRepository);
    redisService = app.get(RedisService);
  });

  beforeEach(async () => {
    await rssRepository.delete({});
    await redisService.set(
      `${REDIS_KEYS.ADMIN_AUTH_KEY}:testSessionId`,
      'test_admin',
    );
  });

  it('[401] 관리자 로그인 쿠키가 없을 경우 RSS 승인을 실패한다.', async () => {
    // when
    const response = await agent.get(URL);

    // then
    expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
  });

  it('[401] 관리자 로그인 쿠키가 만료됐을 경우 RSS 승인을 실패한다.', async () => {
    // when
    const response = await agent.get(URL).set('Cookie', 'sessionId=invalid');

    // then
    expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
  });

  it('[200] 신청된 RSS가 없을 경우 RSS 신청 조회를 성공한다.', async () => {
    // when
    const response = await agent
      .get(URL)
      .set('Cookie', 'sessionId=testSessionId');

    // then
    const { data } = response.body;
    expect(response.status).toBe(HttpStatus.OK);
    expect(data).toStrictEqual([]);
  });

  it('[200] 신청된 RSS가 있을 경우 RSS 신청 조회를 성공한다.', async () => {
    // given
    const rss = await rssRepository.save(RssFixture.createRssFixture());

    // when
    const response = await agent
      .get(URL)
      .set('Cookie', 'sessionId=testSessionId');

    //then
    const { data } = response.body;
    expect(response.status).toBe(HttpStatus.OK);
    expect(data).toStrictEqual([
      {
        id: rss.id,
        name: rss.name,
        userName: rss.userName,
        email: rss.email,
        rssUrl: rss.rssUrl,
      },
    ]);
  });
});
