import { HttpStatus } from '@nestjs/common';

import axios from 'axios';
import supertest from 'supertest';
import TestAgent from 'supertest/lib/agent';

import { REDIS_KEYS } from '@common/redis/redis.constant';
import { RedisService } from '@common/redis/redis.service';

import { Feed } from '@feed/entity/feed.entity';
import { FeedRepository } from '@feed/repository/feed.repository';

import { RssAccept } from '@rss/entity/rss.entity';
import { RssAcceptRepository } from '@rss/repository/rss.repository';

import { FeedFixture } from '@test/config/common/fixture/feed.fixture';
import { RssAcceptFixture } from '@test/config/common/fixture/rss-accept.fixture';
import { testApp } from '@test/config/e2e/env/jest.setup';

const URL = '/api/feeds';

describe(`HEAD ${URL}/{feedId} E2E Test`, () => {
  let feed: Feed;
  let feedRepository: FeedRepository;
  let rssAccept: RssAccept;
  let agent: TestAgent;
  let rssAcceptRepository: RssAcceptRepository;
  let redisService: RedisService;

  beforeAll(() => {
    agent = supertest(testApp.getHttpServer());
    feedRepository = testApp.get(FeedRepository);
    rssAcceptRepository = testApp.get(RssAcceptRepository);
    redisService = testApp.get(RedisService);
  });

  beforeEach(async () => {
    rssAccept = await rssAcceptRepository.save(
      RssAcceptFixture.createRssAcceptFixture(),
    );
    feed = await feedRepository.save(FeedFixture.createFeedFixture(rssAccept));
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('[404] 존재하지 않는 게시글 ID에 요청을 보낼 경우 404를 응답한다.', async () => {
    // Http when
    const response = await agent.head(`${URL}/${Number.MAX_SAFE_INTEGER}`);

    // Http then
    const { data } = response.body;
    expect(response.status).toBe(HttpStatus.NOT_FOUND);
    expect(data).toBeUndefined();

    // DB, Redis when
    const savedFeed = await feedRepository.findOneBy({
      id: feed.id,
    });

    // DB, Redis then
    expect(savedFeed).not.toBeNull();
  });

  it('[404] 원본 게시글이 존재하지 않을 경우 서비스에서 게시글 정보를 삭제하여 조회를 실패한다.', async () => {
    // given
    jest.spyOn(axios, 'get').mockResolvedValue({ data: null, status: HttpStatus.NOT_FOUND });
    const infoKey = REDIS_KEYS.FEED_INFO_ITEM_KEY(feed.id);
    await redisService.redisClient.hset(infoKey, { id: feed.id, title: feed.title });
    await redisService.sadd(REDIS_KEYS.FEED_RECENT_INDEX_KEY, feed.id);
    await redisService.rpush(REDIS_KEYS.FEED_ORIGIN_TREND_KEY, feed.id);
    await redisService.zincrby(REDIS_KEYS.FEED_TREND_KEY, 1, feed.id.toString());

    // Http when
    const response = await agent.head(`${URL}/${feed.id}`);

    // Http then
    const { data } = response.body;
    expect(response.status).toBe(HttpStatus.NOT_FOUND);
    expect(data).toBeUndefined();

    // DB, Redis when
    const [savedFeed, infoExists, isInRecentIndex, originTrendList, trendScore] =
      await Promise.all([
        feedRepository.findOneBy({ id: feed.id }),
        redisService.redisClient.exists(infoKey),
        redisService.sismember(
          REDIS_KEYS.FEED_RECENT_INDEX_KEY,
          feed.id.toString(),
        ),
        redisService.lrange(REDIS_KEYS.FEED_ORIGIN_TREND_KEY, 0, -1),
        redisService.zscore(REDIS_KEYS.FEED_TREND_KEY, feed.id.toString()),
      ]);

    // DB, Redis then
    expect(savedFeed).toBeNull();
    expect(infoExists).toBe(0);
    expect(isInRecentIndex).toBe(0);
    expect(originTrendList).not.toContain(feed.id.toString());
    expect(trendScore).toBeNull();
  });

  it('[200] 원본 게시글이 존재할 경우 조회를 성공한다.', async () => {
    // given
    jest.spyOn(axios, 'get').mockResolvedValue({ data: null, status: HttpStatus.OK });

    // Http when
    const response = await agent.head(`${URL}/${feed.id}`);

    // Http then
    const { data } = response.body;
    expect(response.status).toBe(HttpStatus.OK);
    expect(data).toBeUndefined();

    // DB, Redis when
    const savedFeed = await feedRepository.findOneBy({ id: feed.id });

    // DB, Redis then
    expect(savedFeed).not.toBeNull();
  });
});
