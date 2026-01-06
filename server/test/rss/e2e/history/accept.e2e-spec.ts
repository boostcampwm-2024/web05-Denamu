import { HttpStatus } from '@nestjs/common';
import * as supertest from 'supertest';
import { RssAcceptRepository } from '../../../../src/rss/repository/rss.repository';
import { RssAccept } from '../../../../src/rss/entity/rss.entity';
import { RssAcceptFixture } from '../../../config/common/fixture/rss-accept.fixture';
import { RedisService } from '../../../../src/common/redis/redis.service';
import { REDIS_KEYS } from '../../../../src/common/redis/redis.constant';
import TestAgent from 'supertest/lib/agent';
import { testApp } from '../../../config/e2e/env/jest.setup';

const URL = '/api/rss/history/accept';

describe(`GET ${URL} E2E Test`, () => {
  let agent: TestAgent;
  let rssAcceptList: RssAccept[];
  let rssAcceptRepository: RssAcceptRepository;
  let redisService: RedisService;
  const redisKeyMake = (data: string) => `${REDIS_KEYS.ADMIN_AUTH_KEY}:${data}`;
  const sessionKey = 'admin-rss-history-accept';

  beforeAll(() => {
    agent = supertest(testApp.getHttpServer());
    rssAcceptRepository = testApp.get(RssAcceptRepository);
    redisService = testApp.get(RedisService);
  });

  beforeEach(async () => {
    const rssAccepts = Array.from({ length: 2 }).map(() =>
      RssAcceptFixture.createRssAcceptFixture(),
    );
    [rssAcceptList] = await Promise.all([
      rssAcceptRepository.save(rssAccepts),
      redisService.set(redisKeyMake(sessionKey), 'test1234'),
    ]);
    rssAcceptList.reverse();
  });

  it('[401] 관리자 로그인 쿠키가 없을 경우 RSS 승인 기록 조회를 실패한다.', async () => {
    // Http when
    const response = await agent.get(URL);

    // Http then
    const { data } = response.body;
    expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
    expect(data).toBeUndefined();
  });

  it('[401] 관리자 로그인 쿠키가 만료됐을 경우 RSS 승인 기록 조회를 실패한다.', async () => {
    // Http when
    const response = await agent
      .get(URL)
      .set('Cookie', `sessionId=Wrong${sessionKey}`);

    // Http then
    const { data } = response.body;
    expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
    expect(data).toBeUndefined();
  });

  it('[200] 관리자 로그인이 되어있을 경우 RSS 승인 기록 조회를 성공한다.', async () => {
    // Http when
    const response = await agent
      .get(URL)
      .set('Cookie', `sessionId=${sessionKey}`);

    // Http then
    const { data } = response.body;
    expect(response.status).toBe(HttpStatus.OK);
    expect(data).toStrictEqual(
      rssAcceptList.map((rssAccept) => ({
        blogPlatform: rssAccept.blogPlatform,
        email: rssAccept.email,
        id: rssAccept.id,
        name: rssAccept.name,
        rssUrl: rssAccept.rssUrl,
        userName: rssAccept.userName,
      })),
    );
  });
});
