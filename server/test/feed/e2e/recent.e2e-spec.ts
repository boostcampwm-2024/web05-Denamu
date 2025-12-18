import * as supertest from 'supertest';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { RssAcceptRepository } from '../../../src/rss/repository/rss.repository';
import { RssAcceptFixture } from '../../config/common/fixture/rss-accept.fixture';
import { FeedFixture } from '../../config/common/fixture/feed.fixture';
import { FeedRepository } from '../../../src/feed/repository/feed.repository';
import { RedisService } from '../../../src/common/redis/redis.service';
import { REDIS_KEYS } from '../../../src/common/redis/redis.constant';
import TestAgent from 'supertest/lib/agent';
import { Feed } from '../../../src/feed/entity/feed.entity';
import { RssAccept } from '../../../src/rss/entity/rss.entity';

const URL = '/api/feed/recent';

describe(`GET ${URL} E2E Test`, () => {
  let app: INestApplication;
  let agent: TestAgent;
  let redisService: RedisService;
  let feedList: Feed[];
  let rssAccept: RssAccept;
  let rssAcceptRepository: RssAcceptRepository;
  let feedRepository: FeedRepository;
  const redisKeyMake = (data: string) =>
    `${REDIS_KEYS.FEED_RECENT_KEY}:${data}`;

  beforeAll(async () => {
    app = global.testApp;
    agent = supertest(app.getHttpServer());
    redisService = app.get(RedisService);
    rssAcceptRepository = app.get(RssAcceptRepository);
    feedRepository = app.get(FeedRepository);
  });

  beforeEach(async () => {
    rssAccept = await rssAcceptRepository.save(
      RssAcceptFixture.createRssAcceptFixture(),
    );
    const feeds = FeedFixture.createFeedsFixture(rssAccept, 2);

    // 최신 피드가 앞쪽에 오도록 생성
    feedList = (await feedRepository.save(feeds)).reverse();
  });

  afterEach(async () => {
    await feedRepository.delete(feedList.map((feed) => feed.id));
    await rssAcceptRepository.delete(rssAccept.id);
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

    // cleanup
    await redisService.executePipeline((pipeline) => {
      feedList.forEach((feed) => {
        pipeline.del(redisKeyMake(feed.id.toString()));
      });
    });
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
