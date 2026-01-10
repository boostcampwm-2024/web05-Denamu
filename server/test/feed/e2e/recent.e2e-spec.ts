import { REDIS_KEYS } from '@common/redis/redis.constant';
import { RedisService } from '@common/redis/redis.service';

import { Feed } from '@feed/entity/feed.entity';
import { FeedRepository } from '@feed/repository/feed.repository';

import { RssAccept } from '@rss/entity/rss.entity';
import { RssAcceptRepository } from '@rss/repository/rss.repository';

import { FeedFixture } from '@test/config/common/fixture/feed.fixture';
import { RssAcceptFixture } from '@test/config/common/fixture/rss-accept.fixture';
import { testApp } from '@test/config/e2e/env/jest.setup';

import { HttpStatus } from '@nestjs/common';
import supertest from 'supertest';
import TestAgent from 'supertest/lib/agent';

const URL = '/api/feed/recent';

describe(`GET ${URL} E2E Test`, () => {
  let agent: TestAgent;
  let redisService: RedisService;
  let feedList: Feed[];
  let rssAccept: RssAccept;
  let rssAcceptRepository: RssAcceptRepository;
  let feedRepository: FeedRepository;
  const redisKeyMake = (data: string) =>
    `${REDIS_KEYS.FEED_RECENT_KEY}:${data}`;

  beforeAll(() => {
    agent = supertest(testApp.getHttpServer());
    redisService = testApp.get(RedisService);
    rssAcceptRepository = testApp.get(RssAcceptRepository);
    feedRepository = testApp.get(FeedRepository);
  });

  beforeEach(async () => {
    rssAccept = await rssAcceptRepository.save(
      RssAcceptFixture.createRssAcceptFixture(),
    );
    const feeds = FeedFixture.createFeedsFixture(rssAccept, 2);

    // 최신 피드가 앞쪽에 오도록 생성
    feedList = (await feedRepository.save(feeds)).reverse();
  });

  it('[200] 최신 피드 업데이트 요청이 들어올 경우 최신 피드 제공을 성공한다.', async () => {
    // given
    await redisService.executePipeline((pipeline) => {
      feedList.forEach((feed) => {
        pipeline.hset(redisKeyMake(feed.id.toString()), {
          id: feed.id,
          blogPlatform: feed.blog.blogPlatform,
          createdAt: feed.createdAt.toISOString(),
          viewCount: feed.viewCount,
          blogName: feed.blog.name,
          thumbnail: feed.thumbnail,
          path: feed.path,
          title: feed.title,
          tag: [],
          likes: feed.likeCount,
          comments: feed.commentCount,
        });
      });
    });

    // Http when
    const response = await agent.get(URL);

    // Http then
    const { data } = response.body;
    expect(response.status).toBe(HttpStatus.OK);
    expect(data).toStrictEqual(
      feedList.map((_, i) => {
        const feed = feedList[i];
        return {
          id: feed.id,
          author: feed.blog.name,
          blogPlatform: feed.blog.blogPlatform,
          title: feed.title,
          path: feed.path,
          tag: [],
          createdAt: feed.createdAt.toISOString(),
          thumbnail: feed.thumbnail,
          viewCount: feed.viewCount,
          likes: feed.likeCount,
          isNew: true,
          comments: feed.commentCount,
        };
      }),
    );
  });

  it('[200] 최신 피드가 없을 경우 빈 배열 제공을 성공한다.', async () => {
    // Http when
    const response = await agent.get(URL);

    // Http then
    const { data } = response.body;
    expect(response.status).toBe(HttpStatus.OK);
    expect(data).toStrictEqual([]);
  });
});
