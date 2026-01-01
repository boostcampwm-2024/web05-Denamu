import { HttpStatus } from '@nestjs/common';
import * as supertest from 'supertest';
import { RssFixture } from '../../config/common/fixture/rss.fixture';
import { RssRepository } from '../../../src/rss/repository/rss.repository';
import TestAgent from 'supertest/lib/agent';
import { RedisService } from '../../../src/common/redis/redis.service';
import { REDIS_KEYS } from '../../../src/common/redis/redis.constant';
import { testApp } from '../../config/e2e/env/jest.setup';

const URL = '/api/rss';

describe(`GET ${URL} E2E Test`, () => {
  let agent: TestAgent;
  let rssRepository: RssRepository;
  let redisService: RedisService;
  const redisKeyMake = (data: string) => `${REDIS_KEYS.ADMIN_AUTH_KEY}:${data}`;
  const sessionKey = 'admin-rss-get';

  beforeAll(() => {
    agent = supertest(testApp.getHttpServer());
    rssRepository = testApp.get(RssRepository);
    redisService = testApp.get(RedisService);
  });

  beforeEach(async () => {
    await redisService.set(redisKeyMake(sessionKey), 'test1234');
  });

  afterEach(async () => {
    await redisService.del(redisKeyMake(sessionKey));
  });

  it('[401] 관리자 로그인 쿠키가 없을 경우 RSS 조회를 실패한다.', async () => {
    // Http when
    const response = await agent.get(URL);

    // Http then
    const { data } = response.body;
    expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
    expect(data).toBeUndefined();
  });

  it('[401] 관리자 로그인 쿠키가 만료됐을 경우 RSS 조회를 실패한다.', async () => {
    // Http when
    const response = await agent
      .get(URL)
      .set('Cookie', `sessionId=Wrong${sessionKey}`);

    // Http then
    const { data } = response.body;
    expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
    expect(data).toBeUndefined();
  });

  it('[200] 신청된 RSS가 없을 경우 RSS 신청 조회를 성공한다.', async () => {
    // Http when
    const response = await agent
      .get(URL)
      .set('Cookie', `sessionId=${sessionKey}`);

    // Http then
    const { data } = response.body;
    expect(response.status).toBe(HttpStatus.OK);
    expect(data).toStrictEqual([]);
  });

  it('[200] 신청된 RSS가 있을 경우 RSS 신청 조회를 성공한다.', async () => {
    // given
    const rss = await rssRepository.save(RssFixture.createRssFixture());

    // Http when
    const response = await agent
      .get(URL)
      .set('Cookie', `sessionId=${sessionKey}`);

    // Http then
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

    // cleanup
    await rssRepository.delete(rss.id);
  });
});
