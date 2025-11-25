import { INestApplication } from '@nestjs/common';
import { RedisService } from '../../../src/common/redis/redis.service';
import { REDIS_KEYS } from '../../../src/common/redis/redis.constant';
import { RssAcceptFixture } from '../../fixture/rss-accept.fixture';
import { FeedRepository } from '../../../src/feed/repository/feed.repository';
import { RssAcceptRepository } from '../../../src/rss/repository/rss.repository';
import { FeedFixture } from '../../fixture/feed.fixture';
import * as EventSource from 'eventsource';
import { Feed } from '../../../src/feed/entity/feed.entity';

const URL = '/api/feed/trend/sse';

describe(`SSE ${URL} E2E Test`, () => {
  let app: INestApplication;
  let serverUrl: string;
  let feedList: Feed[];

  beforeAll(async () => {
    app = global.testApp;
    const httpServer = await app.listen(0);
    const port = httpServer.address().port;
    serverUrl = `http://localhost:${port}${URL}`;
  });

  it('[SSE] 최초 연결을 할 경우 트랜드 데이터 최대 4개 제공 수신을 성공한다.', async () => {
    // given
    const feedRepository = app.get(FeedRepository);
    const rssAcceptRepository = app.get(RssAcceptRepository);
    const redisService = app.get(RedisService);
    const rssAccept = await rssAcceptRepository.save(
      RssAcceptFixture.createRssAcceptFixture(),
    );
    const feeds = Array.from({ length: 2 }).map((_, i) =>
      FeedFixture.createFeedFixture(rssAccept, _, i + 1),
    );
    feedList = await feedRepository.save(feeds);
    await redisService.rpush(
      REDIS_KEYS.FEED_ORIGIN_TREND_KEY,
      feedList[0].id,
      feedList[1].id,
    );

    // when
    const es = new EventSource(serverUrl);
    const data = await new Promise((resolve, reject) => {
      es.onmessage = (event) => {
        try {
          const response = JSON.parse(event.data);
          es.close();
          resolve(response.data);
        } catch (error) {
          es.close();
          reject(error);
        }
      };
      es.onerror = (error) => {
        es.close();
        reject(error);
      };
    });

    // then
    expect(data).toStrictEqual(
      Array.from({ length: 2 }).map((_, i) => {
        const feed = feedList[i];
        return {
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
        };
      }),
    );

    // cleanup
    await feedRepository.delete(feedList.map((_, i) => feedList[i].id));
  });

  it('[SSE] 서버로부터 데이터를 받을 때 게시글이 데나무에서 지워진 경우 빈 피드 정보 수신을 성공한다.', async () => {
    // when
    const es = new EventSource(serverUrl);
    const data = await new Promise((resolve, reject) => {
      es.onmessage = (event) => {
        try {
          const response = JSON.parse(event.data);
          es.close();
          resolve(response.data);
        } catch (error) {
          es.close();
          reject(error);
        }
      };
      es.onerror = (error) => {
        es.close();
        reject(error);
      };
    });

    // then
    expect(data).toStrictEqual([]);
  });
});
