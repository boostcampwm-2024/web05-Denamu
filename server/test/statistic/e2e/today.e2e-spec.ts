import { HttpStatus, INestApplication } from '@nestjs/common';
import { RedisService } from '../../../src/common/redis/redis.service';
import * as supertest from 'supertest';
import { REDIS_KEYS } from '../../../src/common/redis/redis.constant';
import { RssAcceptFixture } from '../../fixture/rss-accept.fixture';
import { FeedRepository } from '../../../src/feed/repository/feed.repository';
import { RssAcceptRepository } from '../../../src/rss/repository/rss.repository';
import { FeedFixture } from '../../fixture/feed.fixture';
import { Feed } from '../../../src/feed/entity/feed.entity';
import TestAgent from 'supertest/lib/agent';

describe('GET /api/statistic/today E2E Test', () => {
  let app: INestApplication;
  let agent: TestAgent;

  beforeAll(async () => {
    app = global.testApp;
    agent = supertest(app.getHttpServer());
    const feedRepository = app.get(FeedRepository);
    const rssAcceptRepository = app.get(RssAcceptRepository);
    const redisService = app.get(RedisService);
    const [blog] = await Promise.all([
      rssAcceptRepository.save(RssAcceptFixture.createRssAcceptFixture()),
      redisService.zadd(REDIS_KEYS.FEED_TREND_KEY, 5, '1', 4, '2'),
    ]);
    const feeds: Feed[] = [];
    for (let i = 1; i <= 2; i++) {
      feeds.push(FeedFixture.createFeedFixture(blog, {}, i));
    }
    await feedRepository.insert(feeds);
  });

  it('[200] 값을 입력 하지 않으면 10개의 데이터만 응답한다.', async () => {
    // when
    const response = await agent.get('/api/statistic/today');

    // then
    expect(response.status).toBe(HttpStatus.OK);
    expect(response.body.data.map((feed) => feed.id)).toStrictEqual([1, 2]);
  });

  it('[200] 양수를 입력하면 제한된 개수의 통계 결과를 응답한다.', async () => {
    // when
    const response = await agent.get('/api/statistic/today?limit=1');

    // then
    expect(response.status).toBe(HttpStatus.OK);
    expect(response.body.data.map((feed) => feed.id)).toStrictEqual([1]);
  });
});
