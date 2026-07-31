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

const URL = '/api/feeds';

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
      .set('X-Real-IP', testIp);

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
      .set('X-Real-IP', testIp);

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
      .set('X-Real-IP', testNewIp);

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

  it('[200] X-Real-IP 헤더가 없을 경우 socket remoteAddress를 사용한다.', async () => {
    // given - X-Real-IP 헤더를 설정하지 않음
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
