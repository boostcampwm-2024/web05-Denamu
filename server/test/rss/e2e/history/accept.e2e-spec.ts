import { HttpStatus, INestApplication } from '@nestjs/common';
import * as supertest from 'supertest';
import { RssAcceptRepository } from '../../../../src/rss/repository/rss.repository';
import { RssAccept } from '../../../../src/rss/entity/rss.entity';
import { RssAcceptFixture } from '../../../config/common/fixture/rss-accept.fixture';
import { RedisService } from '../../../../src/common/redis/redis.service';
import { REDIS_KEYS } from '../../../../src/common/redis/redis.constant';
import TestAgent from 'supertest/lib/agent';

const URL = '/api/rss/history/accept';

describe(`GET ${URL} E2E Test`, () => {
  let app: INestApplication;
  let agent: TestAgent;
  let rssAcceptList: RssAccept[];
  const redisKeyMake = (data: string) => `${REDIS_KEYS.ADMIN_AUTH_KEY}:${data}`;
  const sessionKey = 'admin-rss-history-accept';

  beforeAll(async () => {
    app = global.testApp;
    agent = supertest(app.getHttpServer());
    const rssAcceptRepository = app.get(RssAcceptRepository);
    const redisService = app.get(RedisService);
    const rssAccepts = Array.from({ length: 2 }).map((_, i) =>
      RssAcceptFixture.createRssAcceptFixture({}, i + 1),
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
      Array.from({ length: 2 }).map((_, i) => {
        const rssAccept = rssAcceptList[i];
        return {
          id: rssAccept.id,
          name: rssAccept.name,
          userName: rssAccept.userName,
          email: rssAccept.email,
          rssUrl: rssAccept.rssUrl,
          blogPlatform: rssAccept.blogPlatform,
        };
      }),
    );
  });
});
