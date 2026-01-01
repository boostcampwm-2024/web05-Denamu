import { RssAccept } from './../../../src/rss/entity/rss.entity';
import { HttpStatus } from '@nestjs/common';
import { RedisService } from '../../../src/common/redis/redis.service';
import * as supertest from 'supertest';
import { REDIS_KEYS } from '../../../src/common/redis/redis.constant';
import { RssAcceptFixture } from '../../config/common/fixture/rss-accept.fixture';
import { FeedRepository } from '../../../src/feed/repository/feed.repository';
import { RssAcceptRepository } from '../../../src/rss/repository/rss.repository';
import { FeedFixture } from '../../config/common/fixture/feed.fixture';
import TestAgent from 'supertest/lib/agent';
import { Feed } from '../../../src/feed/entity/feed.entity';
import { ReadStatisticRequestDto } from '../../../src/statistic/dto/request/readStatistic.dto';
import { testApp } from '../../config/e2e/env/jest.setup';

const URL = '/api/statistic/today';

describe(`GET ${URL}?limit={} E2E Test`, () => {
  let agent: TestAgent;
  let redisService: RedisService;
  let feedList: Feed[];
  let feedRepository: FeedRepository;
  let rssAcceptRepository: RssAcceptRepository;
  let rssAccept: RssAccept;

  beforeAll(async () => {
    agent = supertest(testApp.getHttpServer());
    feedRepository = testApp.get(FeedRepository);
    rssAcceptRepository = testApp.get(RssAcceptRepository);
    redisService = testApp.get(RedisService);
  });

  beforeEach(async () => {
    rssAccept = await rssAcceptRepository.save(
      RssAcceptFixture.createRssAcceptFixture(),
    );
    const feeds = Array.from({ length: 2 }).map((_, i) =>
      FeedFixture.createFeedFixture(rssAccept),
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

  afterEach(async () => {
    await rssAcceptRepository.delete(rssAccept.id);
    await Promise.all([
      feedRepository.delete(feedList.map((feed) => feed.id)),
      redisService.del(REDIS_KEYS.FEED_TREND_KEY),
    ]);
  });

  it('[200] 금일 조회수 통계 요청을 받은 경우 금일 조회수 통계 조회를 성공한다. ', async () => {
    // Http when
    const response = await agent.get(URL);

    // Http then
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
    // given
    const requestDto = new ReadStatisticRequestDto({ limit: 1 });

    // Http when
    const response = await agent.get(URL).query(requestDto);

    // Http then
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
