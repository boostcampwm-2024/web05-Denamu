import { HttpStatus, INestApplication } from '@nestjs/common';
import * as supertest from 'supertest';
import { RssAcceptRepository } from '../../../../src/rss/repository/rss.repository';
import { RssAccept } from '../../../../src/rss/entity/rss.entity';
import { RssAcceptFixture } from '../../../fixture/rss-accept.fixture';
import { RedisService } from '../../../../src/common/redis/redis.service';
import { REDIS_KEYS } from '../../../../src/common/redis/redis.constant';
import TestAgent from 'supertest/lib/agent';

describe('GET /api/rss/history/accept E2E Test', () => {
  let app: INestApplication;
  let agent: TestAgent;
  let rssAcceptList: RssAccept[];

  beforeAll(async () => {
    app = global.testApp;
    agent = supertest(app.getHttpServer());
    const rssAcceptRepository = app.get(RssAcceptRepository);
    const redisService = app.get(RedisService);
    const rssAcceptData = Array.from({ length: 2 }).map((_, i) =>
      RssAcceptFixture.createRssAcceptFixture({}, i + 1),
    );
    [rssAcceptList] = await Promise.all([
      rssAcceptRepository.save(rssAcceptData),
      redisService.set(
        `${REDIS_KEYS.ADMIN_AUTH_KEY}:testSessionId`,
        'test1234',
      ),
    ]);
  });

  it('[401] 관리자 로그인이 되어있지 않을 경우 RSS 승인 기록 조회를 실패한다.', async () => {
    // when
    const noCookieResponse = await agent.get('/api/rss/history/accept');
    const noSessionResponse = await agent
      .get('/api/rss/history/accept')
      .set('Cookie', 'sessionId=invalid');

    // then
    expect(noCookieResponse.status).toBe(HttpStatus.UNAUTHORIZED);
    expect(noSessionResponse.status).toBe(HttpStatus.UNAUTHORIZED);
  });

  it('[200] 관리자 로그인이 되어있을 경우 RSS 승인 기록 조회를 성공한다.', async () => {
    // when
    const response = await agent
      .get('/api/rss/history/accept')
      .set('Cookie', 'sessionId=testSessionId');

    // then
    expect(response.status).toBe(HttpStatus.OK);
    expect(response.body.data.map((acceptRss) => acceptRss.id)).toStrictEqual(
      rssAcceptList.map((rss) => rss.id).reverse(),
    );
  });
});
