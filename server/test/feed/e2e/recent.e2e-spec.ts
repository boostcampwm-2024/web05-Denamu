import * as supertest from 'supertest';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { RssAcceptRepository } from '../../../src/rss/repository/rss.repository';
import { RssAcceptFixture } from '../../fixture/rss-accept.fixture';
import { FeedFixture } from '../../fixture/feed.fixture';
import { FeedRepository } from '../../../src/feed/repository/feed.repository';
import { RedisService } from '../../../src/common/redis/redis.service';
import { REDIS_KEYS } from '../../../src/common/redis/redis.constant';
import TestAgent from 'supertest/lib/agent';

describe('GET /api/feed/recent E2E Test', () => {
  let app: INestApplication;
  let agent: TestAgent;
  let redisService: RedisService;
  let rssAcceptRepository: RssAcceptRepository;

  beforeAll(async () => {
    app = global.testApp;
    agent = supertest(app.getHttpServer());
    rssAcceptRepository = app.get(RssAcceptRepository);
    redisService = app.get(RedisService);
  });

  it('[200] 최신 피드 업데이트 요청이 들어올 경우 최신 피드 제공을 성공한다.', async () => {
    // given
    const blog = await rssAcceptRepository.save(
      RssAcceptFixture.createRssAcceptFixture(),
    );
    const feedRepository = app.get(FeedRepository);
    const feedList = Array.from({ length: 2 }).map((_, i) => {
      const date = new Date();
      date.setHours(date.getHours() + i);
      return FeedFixture.createFeedFixture(blog, { createdAt: date }, i + 1);
    });
    const feeds = await feedRepository.save(feedList);
    await redisService.executePipeline((pipeline) => {
      pipeline.hset(`${REDIS_KEYS.FEED_RECENT_KEY}:${feeds[0].id}`, feeds[0]);
      pipeline.hset(`${REDIS_KEYS.FEED_RECENT_KEY}:${feeds[1].id}`, feeds[1]);
    });

    // when
    const response = await agent.get('/api/feed/recent');

    // then
    expect(response.status).toBe(HttpStatus.OK);
    expect(response.body.data.map((feed) => feed.id)).toStrictEqual([
      feeds[1].id.toString(),
      feeds[0].id.toString(),
    ]);

    // cleanup
    await redisService.executePipeline((pipeline) => {
      pipeline.del(`${REDIS_KEYS.FEED_RECENT_KEY}:${feeds[0].id}`);
      pipeline.del(`${REDIS_KEYS.FEED_RECENT_KEY}:${feeds[1].id}`);
    });
  });

  it('[200] 최신 피드가 없을 경우 빈 배열 제공을 성공한다.', async () => {
    // given
    await redisService.flushdb();

    // when
    const response = await agent.get('/api/feed/recent');

    // then
    expect(response.status).toBe(HttpStatus.OK);
    expect(response.body.data.map((feed) => feed.id)).toStrictEqual([]);
  });
});
