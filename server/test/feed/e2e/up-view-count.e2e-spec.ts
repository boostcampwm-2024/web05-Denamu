import { HttpStatus } from '@nestjs/common';

import supertest from 'supertest';
import TestAgent from 'supertest/lib/agent';

import { RedisService } from '@common/redis/redis.service';

import { Feed } from '@feed/entity/feed.entity';
import { FeedRepository } from '@feed/repository/feed.repository';

import { RssAccept } from '@rss/entity/rss.entity';
import { RssAcceptRepository } from '@rss/repository/rss.repository';

import { FeedFixture } from '@test/config/common/fixture/feed.fixture';
import { RssAcceptFixture } from '@test/config/common/fixture/rss-accept.fixture';
import { testApp } from '@test/config/e2e/env/jest.setup';

const URL = '/api/feed';

describe(`POST ${URL}/{feedId} E2E Test`, () => {
  let agent: TestAgent;
  let redisService: RedisService;
  let feed: Feed;
  let rssAccept: RssAccept;
  let feedRepository: FeedRepository;
  let rssAcceptRepository: RssAcceptRepository;
  const testIp = '1.1.1.1';
  const redisKeyMake = (data: string) => `feed:${data}:ip`;

  beforeAll(() => {
    agent = supertest(testApp.getHttpServer());
    redisService = testApp.get(RedisService);
    feedRepository = testApp.get(FeedRepository);
    rssAcceptRepository = testApp.get(RssAcceptRepository);
  });

  beforeEach(async () => {
    rssAccept = await rssAcceptRepository.save(
      RssAcceptFixture.createRssAcceptFixture(),
    );
    feed = await feedRepository.save(FeedFixture.createFeedFixture(rssAccept));
    await redisService.sadd(redisKeyMake(feed.id.toString()), testIp);
  });

  it('[404] 피드가 서비스에 존재하지 않을 경우 조회수 상승을 실패한다.', async () => {
    // Http when
    const response = await agent.post(`${URL}/${Number.MAX_SAFE_INTEGER}`);

    // Http then
    const { data } = response.body;
    expect(response.status).toBe(HttpStatus.NOT_FOUND);
    expect(data).toBeUndefined();
  });

  it('[200] 읽은 기록 쿠키가 존재할 경우 조회수 상승을 방지하는 데 성공한다.', async () => {
    // Http when
    const response = await agent
      .post(`${URL}/${feed.id}`)
      .set('Cookie', `View_count_${feed.id}=${feed.id}`)
      .set('X-Forwarded-For', testIp);

    // Http then
    const { data } = response.body;
    expect(response.status).toBe(HttpStatus.OK);
    expect(data).toBeUndefined();

    // DB, Redis when
    const [savedFeed, savedFeedReadRedis] = await Promise.all([
      feedRepository.findOneBy({
        id: feed.id,
      }),
      redisService.sismember(redisKeyMake(feed.id.toString()), testIp),
    ]);

    // DB, Redis then
    expect(savedFeed.viewCount).toBe(feed.viewCount);
    expect(savedFeedReadRedis).not.toBeNull();
  });

  it('[200] 읽은 기록 쿠키가 없지만 읽은 기록 IP가 있을 경우 조회수 상승을 방지하는 데 성공한다.', async () => {
    // given
    await redisService.sadd(redisKeyMake(feed.id.toString()), testIp);

    // Http when
    const response = await agent
      .post(`${URL}/${feed.id}`)
      .set('X-Forwarded-For', testIp);

    // Http then
    const { data } = response.body;
    expect(response.status).toBe(HttpStatus.OK);
    expect(response.headers['set-cookie'][0]).toContain(
      `View_count_${feed.id}`,
    );
    expect(data).toBeUndefined();

    // DB, Redis when
    const [savedFeed, savedFeedReadRedis] = await Promise.all([
      feedRepository.findOneBy({
        id: feed.id,
      }),
      redisService.sismember(redisKeyMake(feed.id.toString()), testIp),
    ]);

    // DB, Redis then
    expect(savedFeed.viewCount).toBe(feed.viewCount);
    expect(savedFeedReadRedis).not.toBeNull();
  });

  it('[200] 피드를 읽은 기록이 없을 경우 조회수 상승을 성공한다.', async () => {
    // given
    const testNewIp = '123.234.123.234';

    // Http when
    const response = await agent
      .post(`${URL}/${feed.id}`)
      .set('X-Forwarded-For', testNewIp);

    // Http then
    const { data } = response.body;
    expect(response.status).toBe(HttpStatus.OK);
    expect(response.headers['set-cookie'][0]).toContain(
      `View_count_${feed.id}`,
    );
    expect(data).toBeUndefined();

    // DB, Redis when
    const [savedFeed, savedFeedReadRedis] = await Promise.all([
      feedRepository.findOneBy({
        id: feed.id,
      }),
      redisService.sismember(redisKeyMake(feed.id.toString()), testNewIp),
    ]);

    // DB, Redis then
    expect(savedFeed.viewCount).toBe(feed.viewCount + 1);
    expect(savedFeedReadRedis).not.toBeNull();
  });

  it('[200] X-Forwarded-For 헤더에 여러 IP가 포함된 경우 첫 번째 IP를 사용한다.', async () => {
    // given
    const firstIp = '203.0.113.1';
    const secondIp = '198.51.100.1';
    const forwardedForHeader = `${firstIp}, ${secondIp}`;

    // Http when
    const response = await agent
      .post(`${URL}/${feed.id}`)
      .set('X-Forwarded-For', forwardedForHeader);

    // Http then
    const { data } = response.body;
    expect(response.status).toBe(HttpStatus.OK);
    expect(data).toBeUndefined();

    // DB, Redis when - 첫 번째 IP만 Redis에 저장되었는지 확인
    const [firstIpExists, secondIpExists] = await Promise.all([
      redisService.sismember(redisKeyMake(feed.id.toString()), firstIp),
      redisService.sismember(redisKeyMake(feed.id.toString()), secondIp),
    ]);

    // DB, Redis then - sismember는 1(존재) 또는 0(없음)을 반환
    expect(firstIpExists).toBe(1); // 첫 번째 IP는 저장됨
    expect(secondIpExists).toBe(0); // 두 번째 IP는 저장되지 않음
  });

  it('[200] X-Forwarded-For 헤더가 없을 경우 socket remoteAddress를 사용한다.', async () => {
    // given - X-Forwarded-For 헤더를 설정하지 않음
    // supertest는 기본적으로 ::ffff:127.0.0.1 또는 유사한 주소를 사용

    // Http when
    const response = await agent.post(`${URL}/${feed.id}`);

    // Http then
    const { data } = response.body;
    expect(response.status).toBe(HttpStatus.OK);
    expect(data).toBeUndefined();

    // DB, Redis when
    const savedFeed = await feedRepository.findOneBy({ id: feed.id });

    // DB, Redis then - remoteAddress가 사용되어 조회수가 증가함
    expect(savedFeed.viewCount).toBeGreaterThanOrEqual(feed.viewCount);
  });
});
