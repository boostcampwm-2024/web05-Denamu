import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { RssAcceptRepository } from '../../../../src/rss/repository/rss.repository';
import { RssAccept } from '../../../../src/rss/entity/rss.entity';
import { RssAcceptFixture } from '../../../fixture/rssAccept.fixture';
import { RedisService } from '../../../../src/common/redis/redis.service';

describe('GET /api/rss/history/accept E2E Test', () => {
  let app: INestApplication;
  beforeAll(async () => {
    app = global.testApp;
    const rssAcceptRepository = app.get(RssAcceptRepository);
    const redisService = app.get(RedisService);
    const rssAccepts: RssAccept[] = [];
    for (let i = 1; i <= 2; i++) {
      rssAccepts.push(RssAcceptFixture.createRssAcceptFixture({}, i));
    }
    await Promise.all([
      rssAcceptRepository.insert(rssAccepts),
      redisService.set('auth:sid', 'test1234'),
    ]);
  });

  it('관리자 로그인이 되어있지 않으면 조회할 수 없다.', async () => {
    // when
    const noCookieResponse = await request(app.getHttpServer()).get(
      '/api/rss/history/accept',
    );
    const noSessionResponse = await request(app.getHttpServer())
      .get('/api/rss/history/accept')
      .set('Cookie', 'sessionId=invalid');

    // then
    expect(noCookieResponse.status).toBe(401);
    expect(noSessionResponse.status).toBe(401);
  });

  it('관리자 로그인이 되어 있으면 최신순으로 기록 데이터를 응답한다.', async () => {
    // when
    const response = await request(app.getHttpServer())
      .get('/api/rss/history/accept')
      .set('Cookie', 'sessionId=sid');

    // then
    expect(response.status).toBe(200);
    expect(response.body.data.map((acceptRss) => acceptRss.id)).toStrictEqual([
      2, 1,
    ]);
  });
});
