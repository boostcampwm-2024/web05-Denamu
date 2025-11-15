import * as supertest from 'supertest';
import { REDIS_KEYS } from '../../../src/common/redis/redis.constant';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { RedisService } from '../../../src/common/redis/redis.service';
import { FeedRepository } from '../../../src/feed/repository/feed.repository';
import { RssAcceptRepository } from '../../../src/rss/repository/rss.repository';
import { FeedFixture } from '../../fixture/feed.fixture';
import { RssAcceptFixture } from '../../fixture/rss-accept.fixture';
import TestAgent from 'supertest/lib/agent';

describe('POST /api/feed/{feedId} E2E Test', () => {
  let app: INestApplication;
  let agent: TestAgent;
  let redisService: RedisService;
  const testFeedId = 1;
  const testIp = `1.1.1.1`;
  const latestId = 20;

  beforeAll(async () => {
    app = global.testApp;
    agent = supertest(app.getHttpServer());
    redisService = app.get(RedisService);
    const feedRepository = app.get(FeedRepository);
    const rssAcceptRepository = app.get(RssAcceptRepository);

    const blog = await rssAcceptRepository.save(
      RssAcceptFixture.createRssAcceptFixture(),
    );

    const feeds = Array.from({ length: latestId }).map((_, i) => {
      return FeedFixture.createFeedFixture(blog, _, i + 1);
    });

    await Promise.all([
      feedRepository.insert(feeds),
      redisService.sadd(`feed:${testFeedId}:ip`, testIp),
    ]);
  });

  it('[200] 피드를 읽은 기록이 없을 경우 조회수 상승을 성공한다.', async () => {
    // given
    const testNewIp = `123.234.123.234`;

    try {
      // when
      const response = await agent
        .post(`/api/feed/${testFeedId}`)
        .set('X-Forwarded-For', testNewIp);
      const feedDailyViewCount = parseInt(
        await redisService.zscore(
          REDIS_KEYS.FEED_TREND_KEY,
          testFeedId.toString(),
        ),
      );

      // then
      expect(response.status).toBe(HttpStatus.OK);
      expect(feedDailyViewCount).toBe(1);
      expect(response.headers['set-cookie'][0]).toContain(
        `View_count_${testFeedId}`,
      );
    } finally {
      // cleanup
      await Promise.all([
        redisService.zrem(REDIS_KEYS.FEED_TREND_KEY, testFeedId.toString()),
        redisService.srem(`feed:${testFeedId}:ip`, testNewIp),
      ]);
    }
  });

  it('[404] 피드가 서비스에 존재하지 않을 경우 조회수 상승을 실패한다.', async () => {
    // given
    const notExistFeedId = 50000;

    // when
    const response = await agent.post(`/api/feed/${notExistFeedId}`);

    // then
    expect(response.status).toBe(HttpStatus.NOT_FOUND);
  });

  it('[200] 읽은 기록 쿠키가 존재할 경우 조회수 상승을 하지 않는 행위를 성공한다.', async () => {
    // when
    const response = await agent
      .post(`/api/feed/${testFeedId}`)
      .set('Cookie', `View_count_${testFeedId}=${testFeedId}`)
      .set('X-Forwarded-For', testIp);
    const feedDailyViewCount = await redisService.zscore(
      REDIS_KEYS.FEED_TREND_KEY,
      testFeedId.toString(),
    );

    // then
    expect(response.status).toBe(HttpStatus.OK);
    expect(feedDailyViewCount).toBeNull();
  });

  it('[200] 읽은 기록 쿠기가 없지만 읽은 기록 IP가 있을 경우 조회수 상승을 하지 않는 행위를 성공한다.', async () => {
    // when
    const response = await agent
      .post(`/api/feed/${testFeedId}`)
      .set('X-Forwarded-For', testIp);
    const feedDailyViewCount = await redisService.zscore(
      REDIS_KEYS.FEED_TREND_KEY,
      testFeedId.toString(),
    );

    // then
    expect(response.status).toBe(HttpStatus.OK);
    expect(feedDailyViewCount).toBeNull();
    expect(response.headers['set-cookie'][0]).toContain(
      `View_count_${testFeedId}`,
    );
  });
});
