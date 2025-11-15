import { HttpStatus, INestApplication } from '@nestjs/common';
import * as supertest from 'supertest';
import { RedisService } from '../../../../src/common/redis/redis.service';
import { RssRejectRepository } from '../../../../src/rss/repository/rss.repository';
import { RssReject } from '../../../../src/rss/entity/rss.entity';
import { RssRejectFixture } from '../../../fixture/rss-reject.fixture';
import TestAgent from 'supertest/lib/agent';

describe('GET /api/rss/history/reject E2E Test', () => {
  let app: INestApplication;
  let agent: TestAgent;

  beforeAll(async () => {
    app = global.testApp;
    agent = supertest(app.getHttpServer());
    const rssRejectRepository = app.get(RssRejectRepository);
    const redisService = app.get(RedisService);
    const rssAccepts: RssReject[] = [];
    for (let i = 1; i <= 2; i++) {
      rssAccepts.push(RssRejectFixture.createRssRejectFixture({}, i));
    }
    await Promise.all([
      rssRejectRepository.insert(rssAccepts),
      redisService.set('auth:testSessionId', 'test1234'),
    ]);
  });

  it('[401] 관리자 로그인이 되어 있지 않을 경우 RSS 거절 기록 조회를 실패한다.', async () => {
    // when
    const noCookieResponse = await agent.get('/api/rss/history/reject');
    const noSessionResponse = await agent
      .get('/api/rss/history/reject')
      .set('Cookie', 'sessionId=invalid');

    // then
    expect(noCookieResponse.status).toBe(HttpStatus.UNAUTHORIZED);
    expect(noSessionResponse.status).toBe(HttpStatus.UNAUTHORIZED);
  });

  it('[200] 관리자 로그인이 되어 있을 경우 RSS 거절 기록 조회를 성공한다.', async () => {
    // when
    const response = await agent
      .get('/api/rss/history/reject')
      .set('Cookie', 'sessionId=testSessionId');

    // then
    expect(response.status).toBe(HttpStatus.OK);
    expect(response.body.data.map((rejectRss) => rejectRss.id)).toStrictEqual([
      2, 1,
    ]);
  });
});
