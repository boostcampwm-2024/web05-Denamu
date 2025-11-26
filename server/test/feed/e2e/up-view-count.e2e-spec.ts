import * as supertest from 'supertest';
import { REDIS_KEYS } from '../../../src/common/redis/redis.constant';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { RedisService } from '../../../src/common/redis/redis.service';
import { FeedRepository } from '../../../src/feed/repository/feed.repository';
import { RssAcceptRepository } from '../../../src/rss/repository/rss.repository';
import { FeedFixture } from '../../fixture/feed.fixture';
import { RssAcceptFixture } from '../../fixture/rss-accept.fixture';
import TestAgent from 'supertest/lib/agent';
import { Feed } from '../../../src/feed/entity/feed.entity';

const URL = '/api/feed';

describe(`POST ${URL}/{feedId} E2E Test`, () => {
  let app: INestApplication;
  let agent: TestAgent;
  let redisService: RedisService;
  let feed: Feed;
  let feedRepository: FeedRepository;
  const testIp = '1.1.1.1';

  beforeAll(async () => {
    app = global.testApp;
    agent = supertest(app.getHttpServer());
    redisService = app.get(RedisService);
    feedRepository = app.get(FeedRepository);
    const rssAcceptRepository = app.get(RssAcceptRepository);

    const rssAcceptData = await rssAcceptRepository.save(
      RssAcceptFixture.createRssAcceptFixture(),
    );
    feed = await feedRepository.save(
      FeedFixture.createFeedFixture(rssAcceptData, {}, 1),
    );
    await redisService.sadd(`feed:${feed.id}:ip`, testIp);
  });

  it('[404] 피드가 서비스에 존재하지 않을 경우 조회수 상승을 실패한다.', async () => {
    // when
    const response = await agent.post(`${URL}/${Number.MAX_SAFE_INTEGER}`);

    // then
    const { data } = response.body;
    expect(response.status).toBe(HttpStatus.NOT_FOUND);
    expect(data).toBeUndefined();
  });

  it('[200] 피드를 읽은 기록이 없을 경우 조회수 상승을 성공한다.', async () => {
    // given
    const testNewIp = '123.234.123.234';

    try {
      // when
      const response = await agent
        .post(`${URL}/${feed.id}`)
        .set('X-Forwarded-For', testNewIp);

      // then
      const { data } = response.body;
      expect(response.status).toBe(HttpStatus.OK);
      expect(response.headers['set-cookie'][0]).toContain(
        `View_count_${feed.id}`,
      );
      expect(data).toBeUndefined();
    } finally {
      // cleanup
      await Promise.all([
        redisService.zrem(REDIS_KEYS.FEED_TREND_KEY, feed.id.toString()),
        redisService.srem(`feed:${feed.id}:ip`, testNewIp),
      ]);
      await feedRepository.update(feed.id, { viewCount: 0 });
    }
  });

  it('[200] 읽은 기록 쿠키가 존재할 경우 조회수 상승을 하지 않는 행위를 성공한다.', async () => {
    // when
    const response = await agent
      .post(`${URL}/${feed.id}`)
      .set('Cookie', `View_count_${feed.id}=${feed.id}`)
      .set('X-Forwarded-For', testIp);

    // then
    const { data } = response.body;
    expect(response.status).toBe(HttpStatus.OK);
    expect(data).toBeUndefined();
  });

  it('[200] 읽은 기록 쿠기가 없지만 읽은 기록 IP가 있을 경우 조회수 상승을 하지 않는 행위를 성공한다.', async () => {
    // when
    const response = await agent
      .post(`${URL}/${feed.id}`)
      .set('X-Forwarded-For', testIp);

    // then
    const { data } = response.body;
    expect(response.status).toBe(HttpStatus.OK);
    expect(response.headers['set-cookie'][0]).toContain(
      `View_count_${feed.id}`,
    );
    expect(data).toBeUndefined();
  });
});
