import * as supertest from 'supertest';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { RssAcceptRepository } from '../../../src/rss/repository/rss.repository';
import { FeedRepository } from '../../../src/feed/repository/feed.repository';
import { RssAcceptFixture } from '../../fixture/rss-accept.fixture';
import { FeedFixture } from '../../fixture/feed.fixture';
import { Feed } from '../../../src/feed/entity/feed.entity';
import TestAgent from 'supertest/lib/agent';

describe('GET /api/statistic/all E2E Test', () => {
  let app: INestApplication;
  let agent: TestAgent;
  let feedList: Feed[];

  beforeAll(async () => {
    app = global.testApp;
    agent = supertest(app.getHttpServer());
    const rssAcceptRepository = app.get(RssAcceptRepository);
    const feedRepository = app.get(FeedRepository);
    const blog = await rssAcceptRepository.save(
      RssAcceptFixture.createRssAcceptFixture(),
    );
    const feedData = Array.from({ length: 2 }).map((_, i) =>
      FeedFixture.createFeedFixture(blog, { viewCount: i }, i + 1),
    );
    feedList = await feedRepository.save(feedData);
  });

  it('[200] 전체 조회수 통계 요청을 받은 경우 전체 조회수 통계 조회를 성공한다.', async () => {
    // when
    const response = await agent.get('/api/statistic/all');

    // then
    expect(response.status).toBe(HttpStatus.OK);
    expect(response.body.data.map((feed) => feed.id)).toStrictEqual(
      feedList.map((feed) => feed.id).reverse(),
    );
  });

  it('[200] 전체 조회수 통계에서 개수 제한을 걸 경우 특정 개수만큼의 전체 조회수 통계 조회를 성공한다.', async () => {
    // when
    const response = await agent.get('/api/statistic/all?limit=1');

    // then
    expect(response.status).toBe(HttpStatus.OK);
    expect(response.body.data.map((feed) => feed.id)).toStrictEqual(
      feedList
        .map((feed) => feed.id)
        .reverse()
        .slice(0, 1),
    );
  });
});
