import { HttpStatus, INestApplication } from '@nestjs/common';
import { RedisService } from '../../../src/common/redis/redis.service';
import * as supertest from 'supertest';
import { REDIS_KEYS } from '../../../src/common/redis/redis.constant';
import { RssAcceptFixture } from '../../fixture/rss-accept.fixture';
import { FeedRepository } from '../../../src/feed/repository/feed.repository';
import { RssAcceptRepository } from '../../../src/rss/repository/rss.repository';
import { FeedFixture } from '../../fixture/feed.fixture';
import TestAgent from 'supertest/lib/agent';
import { Feed } from '../../../src/feed/entity/feed.entity';

describe('GET /api/statistic/today E2E Test', () => {
  let app: INestApplication;
  let agent: TestAgent;
  let redisService: RedisService;
  let feedList: Feed[];

  beforeAll(async () => {
    app = global.testApp;
    agent = supertest(app.getHttpServer());
    const feedRepository = app.get(FeedRepository);
    const rssAcceptRepository = app.get(RssAcceptRepository);
    redisService = app.get(RedisService);
    const rssAccept = await rssAcceptRepository.save(
      RssAcceptFixture.createRssAcceptFixture(),
    );
    const feeds = Array.from({ length: 2 }).map((_, i) =>
      FeedFixture.createFeedFixture(rssAccept, {}, i + 1),
    );
    feedList = await feedRepository.save(feeds);
    await redisService.zadd(
      REDIS_KEYS.FEED_TREND_KEY,
      5,
      feedList[0].id,
      4,
      feedList[1].id,
    );
  });

  it('[200] 금일 조회수 통계 요청을 받은 경우 금일 조회수 통계 조회를 성공한다. ', async () => {
    // when
    const response = await agent.get('/api/statistic/today');

    // then
    const { data } = response.body;
    expect(response.status).toBe(HttpStatus.OK);
    expect(data).toStrictEqual(
      await Promise.all(
        Array.from({ length: 2 }).map(async (_, i) => {
          const feed = feedList[i];
          return {
            id: feed.id,
            title: feed.title,
            viewCount: parseInt(
              await redisService.zscore(
                REDIS_KEYS.FEED_TREND_KEY,
                feed.id.toString(),
              ),
            ),
          };
        }),
      ),
    );
  });

  it('[200] 금일 조회수 통계에서 개수 제한을 걸 경우 특정 개수만큼의 금일 조회수 통계 조회를 성공한다.', async () => {
    // when
    const response = await agent.get('/api/statistic/today?limit=1');

    // then
    const { data } = response.body;
    expect(response.status).toBe(HttpStatus.OK);
    expect(data).toStrictEqual(
      await Promise.all(
        Array.from({ length: 1 }).map(async (_, i) => {
          const feed = feedList[i];
          return {
            id: feed.id,
            title: feed.title,
            viewCount: parseInt(
              await redisService.zscore(
                REDIS_KEYS.FEED_TREND_KEY,
                feed.id.toString(),
              ),
            ),
          };
        }),
      ),
    );
  });
});
