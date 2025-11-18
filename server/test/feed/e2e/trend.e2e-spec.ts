import { INestApplication } from '@nestjs/common';
import { RedisService } from '../../../src/common/redis/redis.service';
import { REDIS_KEYS } from '../../../src/common/redis/redis.constant';
import { RssAcceptFixture } from '../../fixture/rss-accept.fixture';
import { FeedRepository } from '../../../src/feed/repository/feed.repository';
import { RssAcceptRepository } from '../../../src/rss/repository/rss.repository';
import { Feed } from '../../../src/feed/entity/feed.entity';
import { FeedFixture } from '../../fixture/feed.fixture';
import * as EventSource from 'eventsource';

describe('SSE /api/trend/sse E2E Test', () => {
  let app: INestApplication;
  let feedRepository: FeedRepository;
  let serverUrl: string;

  beforeAll(async () => {
    app = global.testApp;
    feedRepository = app.get(FeedRepository);
    const rssAcceptRepository = app.get(RssAcceptRepository);
    const redisService = app.get(RedisService);
    const [blog] = await Promise.all([
      rssAcceptRepository.save(RssAcceptFixture.createRssAcceptFixture()),
      redisService.rpush(REDIS_KEYS.FEED_ORIGIN_TREND_KEY, 1, 2),
    ]);
    const feeds: Feed[] = [];
    for (let i = 1; i <= 2; i++) {
      feeds.push(FeedFixture.createFeedFixture(blog, {}, i));
    }
    const [_, httpServer] = await Promise.all([
      feedRepository.insert(feeds),
      app.listen(7000),
    ]);
    const port = httpServer.address().port;
    serverUrl = `http://localhost:${port}/api/feed/trend/sse`;
  });

  it('[SSE] 최초 연결을 할 경우 트랜드 데이터 최대 4개 제공 수신을 성공한다.', async () => {
    // given
    const es = new EventSource(serverUrl);
    const timeout = new Promise((_, reject) =>
      setTimeout(
        () => reject(new Error('Timeout occurred before receiving data')),
        1000,
      ),
    );
    const eventResult = new Promise((resolve, reject) => {
      es.onmessage = (event) => {
        try {
          const response = JSON.parse(event.data);
          const feedList = response.data;
          const idList = feedList.map((feed) => feed.id);
          es.close();
          resolve(idList);
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

    // when
    const idList = await Promise.race([eventResult, timeout]);

    // then
    expect(idList).toStrictEqual([1, 2]);
  });

  it('[SSE] 서버로부터 데이터를 받을 때 게시글이 데나무에서 지워진 경우 빈 피드 정보 수신을 성공한다.', async () => {
    // given
    await feedRepository.delete({ id: 2 });
    const es = new EventSource(serverUrl);
    const timeout = new Promise((_, reject) =>
      setTimeout(
        () => reject(new Error('Timeout occurred before receiving data')),
        1000,
      ),
    );
    const eventResult = new Promise((resolve, reject) => {
      es.onmessage = (event) => {
        try {
          const response = JSON.parse(event.data);
          const feedList = response.data;
          const idList = feedList.map((feed) => feed.id);
          es.close();
          resolve(idList);
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

    // when
    const idList = await Promise.race([eventResult, timeout]);

    // then
    expect(idList).toStrictEqual([1]);
  });
});
