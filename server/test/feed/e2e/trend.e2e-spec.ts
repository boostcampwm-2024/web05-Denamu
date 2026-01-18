import EventSource from 'eventsource';

import { REDIS_KEYS } from '@common/redis/redis.constant';
import { RedisService } from '@common/redis/redis.service';

import { FeedRepository } from '@feed/repository/feed.repository';

import { RssAccept } from '@rss/entity/rss.entity';
import { RssAcceptRepository } from '@rss/repository/rss.repository';

import { FeedFixture } from '@test/config/common/fixture/feed.fixture';
import { RssAcceptFixture } from '@test/config/common/fixture/rss-accept.fixture';
import { testApp } from '@test/config/e2e/env/jest.setup';

const URL = '/api/feed/trend/sse';

describe(`SSE ${URL} E2E Test`, () => {
  let serverUrl: string;
  let feedRepository: FeedRepository;
  let rssAcceptRepository: RssAcceptRepository;
  let redisService: RedisService;
  let rssAccept: RssAccept;

  beforeAll(async () => {
    const httpServer = await testApp.listen(0);
    const port = httpServer.address().port;
    serverUrl = `http://localhost:${port}${URL}`;
    feedRepository = testApp.get(FeedRepository);
    rssAcceptRepository = testApp.get(RssAcceptRepository);
    redisService = testApp.get(RedisService);
  });

  beforeEach(async () => {
    rssAccept = await rssAcceptRepository.save(
      RssAcceptFixture.createRssAcceptFixture(),
    );
  });

  it('[SSE] 최초 연결을 할 경우 트랜드 데이터 최대 4개 제공 수신을 성공한다.', async () => {
    // given
    const feeds = Array.from({ length: 2 }).map(() =>
      FeedFixture.createFeedFixture(rssAccept),
    );
    const feedList = await feedRepository.save(feeds);
    await redisService.rpush(
      REDIS_KEYS.FEED_ORIGIN_TREND_KEY,
      feedList[0].id,
      feedList[1].id,
    );

    // SSE when
    const es = new EventSource(serverUrl);
    const data = await new Promise((resolve, reject) => {
      es.onmessage = (event) => {
        try {
          const response = JSON.parse(event.data) as { data?: unknown };
          es.close();
          resolve(response.data);
        } catch {
          es.close();
          reject(new Error(`SSE 연결 오류: ${JSON.stringify(event)}`));
        }
      };
      es.onerror = (event) => {
        es.close();
        reject(new Error(`SSE 연결 오류: ${JSON.stringify(event)}`));
      };
    });

    // SSE then
    expect(data).toStrictEqual(
      feedList.map((feed) => ({
        id: feed.id,
        author: feed.blog.name,
        blogPlatform: feed.blog.blogPlatform,
        title: feed.title,
        path: feed.path,
        createdAt: feed.createdAt.toISOString(),
        thumbnail: feed.thumbnail,
        viewCount: feed.viewCount,
        likes: feed.likeCount,
        comments: feed.commentCount,
        tag: [],
      })),
    );
  });

  it('[SSE] 서버로부터 데이터를 받을 때 게시글이 데나무에서 지워진 경우 빈 피드 정보 수신을 성공한다.', async () => {
    // given
    await redisService.rpush(REDIS_KEYS.FEED_ORIGIN_TREND_KEY, '0');

    // SSE when
    const es = new EventSource(serverUrl);
    const data = await new Promise((resolve, reject) => {
      es.onmessage = (event) => {
        try {
          const response = JSON.parse(event.data) as { data?: unknown };
          es.close();
          resolve(response.data);
        } catch {
          es.close();
          reject(new Error(`SSE 연결 오류: ${JSON.stringify(event)}`));
        }
      };
      es.onerror = (event) => {
        es.close();
        reject(new Error(`SSE 연결 오류: ${JSON.stringify(event)}`));
      };
    });

    // SSE then
    expect(data).toStrictEqual([]);
  });
});
