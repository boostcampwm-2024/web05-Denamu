import * as request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { Feed } from '../../../src/feed/entity/feed.entity';
import { RssAcceptRepository } from '../../../src/rss/repository/rss.repository';
import { RssAcceptFixture } from '../../fixture/rssAccept.fixture';
import { FeedFixture } from '../../fixture/feed.fixture';
import { FeedRepository } from '../../../src/feed/repository/feed.repository';
import { RedisService } from '../../../src/common/redis/redis.service';

describe('GET /api/feed/recent E2E Test', () => {
  let app: INestApplication;
  let rssAcceptRepository: RssAcceptRepository;

  beforeAll(async () => {
    app = global.testApp;
    rssAcceptRepository = app.get(RssAcceptRepository);
  });

  it('최신 피드 업데이트 요청이 들어오면 내림차순 정렬된 피드 배열을 반환한다.', async () => {
    //given
    const blog = await rssAcceptRepository.save(
      RssAcceptFixture.createRssAcceptFixture(),
    );
    const feedRepository = app.get(FeedRepository);
    const feedList: Feed[] = [];
    const baseDate = new Date();
    for (let i = 0; i < 2; i++) {
      const date = new Date(baseDate);
      date.setHours(date.getHours() + i);
      feedList.push(
        FeedFixture.createFeedFixture(blog, { createdAt: date }, i + 1),
      );
    }
    const redisService = app.get(RedisService);
    const feeds = await feedRepository.save(feedList);
    await redisService.executePipeline((pipeline) => {
      pipeline.hset(`feed:recent:${feeds[0].id}`, feeds[0]);
      pipeline.hset(`feed:recent:${feeds[1].id}`, feeds[1]);
    });

    //when
    const response = await request(app.getHttpServer()).get('/api/feed/recent');

    //then
    expect(response.status).toBe(200);
    expect(response.body.data.map((feed) => feed.id)).toStrictEqual(['2', '1']);
  });

  it('최신 피드가 없다면 빈 배열을 반환한다.', async () => {
    //given
    const redisService = app.get(RedisService);
    redisService.flushdb();

    //when
    const response = await request(app.getHttpServer()).get('/api/feed/recent');

    //then
    expect(response.status).toBe(200);
    expect(response.body.data.map((feed) => feed.id)).toStrictEqual([]);
  });
});
