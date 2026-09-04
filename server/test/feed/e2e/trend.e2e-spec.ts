import EventSource from 'eventsource';
import { Server } from 'http';

import { REDIS_KEYS } from '@common/redis/redis.constant';
import { RedisService } from '@common/redis/redis.service';

import { FeedRepository } from '@feed/repository/feed.repository';
import { FeedService } from '@feed/service/feed.service';

import { RssAccept } from '@rss/entity/rss.entity';
import { RssAcceptRepository } from '@rss/repository/rss.repository';

import { FeedFixture } from '@test/config/common/fixture/feed.fixture';
import { RssAcceptFixture } from '@test/config/common/fixture/rss-accept.fixture';
import { testApp } from '@test/config/e2e/env/jest.setup';

const URL = '/api/feeds/trend/sse';

describe(`SSE ${URL} E2E Test`, () => {
  let serverUrl: string;
  let feedRepository: FeedRepository;
  let rssAcceptRepository: RssAcceptRepository;
  let redisService: RedisService;
  let rssAccept: RssAccept;

  beforeAll(async () => {
    await testApp.listen(0);
    const httpServer = testApp.getHttpServer() as Server;

    const address = httpServer.address();

    if (!address || typeof address === 'string') {
      throw new Error('Invalid address');
    }

    const port = address.port;
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
        blog: {
          name: feed.blog.name,
          platform: feed.blog.blogPlatform,
          image: null,
        },
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

describe('FeedService.cacheTrendFeeds E2E Test', () => {
  let feedService: FeedService;
  let redisService: RedisService;
  let feedRepository: FeedRepository;
  let rssAcceptRepository: RssAcceptRepository;
  let rssAccept: RssAccept;

  beforeAll(() => {
    feedService = testApp.get(FeedService);
    redisService = testApp.get(RedisService);
    feedRepository = testApp.get(FeedRepository);
    rssAcceptRepository = testApp.get(RssAcceptRepository);
  });

  beforeEach(async () => {
    rssAccept = await rssAcceptRepository.save(
      RssAcceptFixture.createRssAcceptFixture(),
    );
  });

  it('feed:info 캐시가 없으면 HSET으로 채우고 TTL을 건다.', async () => {
    // given
    const feed = await feedRepository.save(
      FeedFixture.createFeedFixture(rssAccept),
    );
    const infoKey = REDIS_KEYS.FEED_INFO_ITEM_KEY(feed.id);

    // when
    await feedService.cacheTrendFeeds([
      {
        id: feed.id,
        blog: { name: 'blog', platform: 'tistory', image: null },
        title: feed.title,
        path: feed.path,
        createdAt: feed.createdAt,
        thumbnail: feed.thumbnail,
        viewCount: feed.viewCount,
        likes: feed.likeCount,
        comments: feed.commentCount,
        tag: [],
      },
    ]);

    // then
    const cached = await redisService.redisClient.hgetall(infoKey);
    expect(cached.id).toBe(String(feed.id));
    expect(cached.title).toBe(feed.title);
    const ttl = await redisService.redisClient.ttl(infoKey);
    expect(ttl).toBeGreaterThan(0);
    expect(ttl).toBeLessThanOrEqual(REDIS_KEYS.FEED_INFO_TTL_SECONDS);
  });

  it('feed:info 캐시가 이미 있으면 최신 값으로 덮어쓴다.', async () => {
    // given
    const feed = await feedRepository.save(
      FeedFixture.createFeedFixture(rssAccept),
    );
    const infoKey = REDIS_KEYS.FEED_INFO_ITEM_KEY(feed.id);
    await redisService.executePipeline((pipeline) => {
      pipeline.hset(infoKey, { id: feed.id, likes: '999' });
    });

    // when
    await feedService.cacheTrendFeeds([
      {
        id: feed.id,
        blog: { name: 'blog', platform: 'tistory', image: null },
        title: feed.title,
        path: feed.path,
        createdAt: feed.createdAt,
        thumbnail: feed.thumbnail,
        viewCount: feed.viewCount,
        likes: 5,
        comments: 0,
        tag: [],
      },
    ]);

    // then
    const cached = await redisService.redisClient.hgetall(infoKey);
    expect(cached.likes).toBe('5');
    const ttl = await redisService.redisClient.ttl(infoKey);
    expect(ttl).toBeGreaterThan(0);
  });
});
