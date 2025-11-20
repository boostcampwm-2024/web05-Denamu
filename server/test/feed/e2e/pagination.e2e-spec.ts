import { HttpStatus, INestApplication } from '@nestjs/common';
import * as supertest from 'supertest';
import { FeedFixture } from '../../fixture/feed.fixture';
import { FeedRepository } from '../../../src/feed/repository/feed.repository';
import { RssAcceptRepository } from '../../../src/rss/repository/rss.repository';
import { RssAcceptFixture } from '../../fixture/rss-accept.fixture';
import { ReadFeedPaginationRequestDto } from '../../../src/feed/dto/request/readFeedPagination.dto';
import TestAgent from 'supertest/lib/agent';

describe('GET /api/feed?limit={}&lastId={} E2E Test', () => {
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

    const feeds = Array.from({ length: latestId }).map((_, i) =>
      FeedFixture.createFeedFixture(blog, _, i + 1),
    );

    await feedRepository.insert(feeds);
  });

  it('[200] 마지막 수신 피드 ID가 없을 경우 최신 피드부터 피드 목록 제공을 성공한다.', async () => {
    // given
    const requestDto = new ReadFeedPaginationRequestDto({
      limit: 5,
    });

    // when
    const response = await agent.get('/api/feed').query(requestDto);

    // then
    expect(response.status).toBe(HttpStatus.OK);
    expect(response.body.data.result.map((feed) => feed.id)).toStrictEqual([
      latestId,
      latestId - 1,
      latestId - 2,
      latestId - 3,
      latestId - 4,
    ]);
    expect(response.body.data.hasMore).toBe(true);
    expect(response.body.data.lastId).toBe(16);
  });

  it('[200] 마지막 수신 피드 ID가 있을 경우 마지막 수신 피드 이후의 피드 목록 제공을 성공한다.', async () => {
    // given
    const requestDto = new ReadFeedPaginationRequestDto({
      limit: 5,
      lastId: 11,
    });

    // when
    const response = await agent.get('/api/feed').query(requestDto);

    // then
    expect(response.status).toBe(HttpStatus.OK);
    expect(response.body.data.result.map((feed) => feed.id)).toStrictEqual([
      requestDto.lastId - 1,
      requestDto.lastId - 2,
      requestDto.lastId - 3,
      requestDto.lastId - 4,
      requestDto.lastId - 5,
    ]);
    expect(response.body.data.hasMore).toBe(true);
    expect(response.body.data.lastId).toBe(6);
  });

  it('[200] 받고자 하는 수신 피드 개수가 남은 피드 개수보다 적을 경우 남은 모든 피드 목록 제공을 성공한다.', async () => {
    // given
    const requestDto = new ReadFeedPaginationRequestDto({
      limit: 15,
      lastId: 10,
    });

    // when
    const response = await agent.get('/api/feed').query(requestDto);

    // then
    expect(response.status).toBe(HttpStatus.OK);
    expect(response.body.data.result.map((feed) => feed.id)).toStrictEqual([
      requestDto.lastId - 1,
      requestDto.lastId - 2,
      requestDto.lastId - 3,
      requestDto.lastId - 4,
      requestDto.lastId - 5,
      requestDto.lastId - 6,
      requestDto.lastId - 7,
      requestDto.lastId - 8,
      requestDto.lastId - 9,
    ]);
    expect(response.body.data.hasMore).toBe(false);
    expect(response.body.data.lastId).toBe(1);
  });

  it('[200] 남은 피드 개수가 없을 경우 빈 배열과 마지막 피드 ID를 0으로 제공을 성공한다.', async () => {
    // given
    const requestDto = new ReadFeedPaginationRequestDto({
      limit: 15,
      lastId: 1,
    });

    // when
    const response = await agent.get('/api/feed').query(requestDto);

    // then
    expect(response.status).toBe(HttpStatus.OK);
    expect(response.body.data.result.map((feed) => feed.id)).toStrictEqual([]);
    expect(response.body.data.hasMore).toBe(false);
    expect(response.body.data.lastId).toBe(0);
  });
});
