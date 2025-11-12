import { HttpStatus, INestApplication } from '@nestjs/common';
import * as supertest from 'supertest';
import { FeedFixture } from '../../fixture/feed.fixture';
import { FeedRepository } from '../../../src/feed/repository/feed.repository';
import { RssAcceptRepository } from '../../../src/rss/repository/rss.repository';
import { RssAcceptFixture } from '../../fixture/rss-accept.fixture';
import { ManageFeedRequestDto } from '../../../src/feed/dto/request/manageFeed.dto';
import TestAgent from 'supertest/lib/agent';

describe('GET /api/feed/detail/{feedId} E2E Test', () => {
  let app: INestApplication;
  let agent: TestAgent;
  const latestId = 20;

  beforeAll(async () => {
    app = global.testApp;
    agent = supertest(app.getHttpServer());
    const feedRepository = app.get(FeedRepository);
    const rssAcceptRepository = app.get(RssAcceptRepository);

    const blog = await rssAcceptRepository.save(
      RssAcceptFixture.createRssAcceptFixture(),
    );

    const feeds = Array.from({ length: latestId }).map((_, i) => {
      return FeedFixture.createFeedFixture(blog, _, i + 1);
    });

    await feedRepository.insert(feeds);
  });

  it('[200] feedId를 요청 받으면 해당 Feed의 정보로 응답한다.', async () => {
    // given
    const feedDetailRequestDto = new ManageFeedRequestDto({
      feedId: 1,
    });

    // when
    const response = await agent.get(
      `/api/feed/detail/${feedDetailRequestDto.feedId}`,
    );

    // then
    expect(response.status).toBe(HttpStatus.OK);
    expect(response.body.data.id).toBe(1);
  });

  it('[200] 태그가 없다면 빈 배열로 응답한다.', async () => {
    // given
    const feedDetailRequestDto = new ManageFeedRequestDto({
      feedId: 11,
    });

    // when
    const response = await agent.get(
      `/api/feed/detail/${feedDetailRequestDto.feedId}`,
    );

    // then
    expect(response.status).toBe(HttpStatus.OK);
    expect(response.body.data.id).toBe(11);
    expect(response.body.data.tag).toStrictEqual([]);
  });

  it('[404] 없는 피드를 조회한다면 404번 에러를 반환한다.', async () => {
    // given
    const feedDetailRequestDto = new ManageFeedRequestDto({
      feedId: 100,
    });

    // when
    const response = await agent.get(
      `/api/feed/detail/${feedDetailRequestDto.feedId}`,
    );

    // then
    expect(response.status).toBe(HttpStatus.NOT_FOUND);
  });
});
