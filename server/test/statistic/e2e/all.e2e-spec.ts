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

  beforeAll(async () => {
    app = global.testApp;
    agent = supertest(app.getHttpServer());
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

  it('[200] 전체 조회수 통계 요청을 받은 경우 전체 조회수 통계 조회를 성공한다.', async () => {
    // when
    const response = await agent.get('/api/statistic/all');

    // then
    expect(response.status).toBe(HttpStatus.OK);
    expect(response.body.data.map((feed) => feed.id)).toStrictEqual([2, 1]);
  });

  it('[200] 전체 조회수 통계에서 개수 제한을 걸 경우 특정 개수만큼의 전체 조회수 통계 조회를 성공한다.', async () => {
    // when
    const response = await agent.get('/api/statistic/all?limit=1');

    // then
    expect(response.status).toBe(HttpStatus.OK);
    expect(response.body.data.map((feed) => feed.id)).toStrictEqual([2]);
  });
});
