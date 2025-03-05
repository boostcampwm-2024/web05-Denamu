import * as request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { RssAcceptRepository } from '../../../src/rss/repository/rss.repository';
import { FeedRepository } from '../../../src/feed/repository/feed.repository';
import { RssAcceptFixture } from '../../fixture/rssAccept.fixture';
import { FeedFixture } from '../../fixture/feed.fixture';
import { Feed } from '../../../src/feed/entity/feed.entity';

describe('GET /api/statistic/all E2E Test', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = global.testApp;
    const rssAcceptRepository = app.get(RssAcceptRepository);
    const feedRepository = app.get(FeedRepository);
    const blog = await rssAcceptRepository.save(
      RssAcceptFixture.createRssAcceptFixture(),
    );
    const feeds: Feed[] = [];
    for (let i = 1; i <= 2; i++) {
      feeds.push(FeedFixture.createFeedFixture(blog, { viewCount: i - 1 }, i));
    }
    await feedRepository.insert(feeds);
  });

  it('값을 입력 하지 않으면 10개의 데이터만 응답한다.', async () => {
    // when
    const response = await request(app.getHttpServer()).get(
      '/api/statistic/all',
    );

    // then
    expect(response.status).toBe(200);
    expect(response.body.data.map((feed) => feed.id)).toStrictEqual([2, 1]);
  });
  it('양수를 입력하면 제한된 개수의 통계 결과를 응답한다.', async () => {
    // when
    const response = await request(app.getHttpServer()).get(
      '/api/statistic/all?limit=1',
    );

    // then
    expect(response.status).toBe(200);
    expect(response.body.data.map((feed) => feed.id)).toStrictEqual([2]);
  });
});
