import { HttpStatus, INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { FeedFixture } from '../../fixture/feed.fixture';
import { FeedRepository } from '../../../src/feed/repository/feed.repository';
import { RssAcceptRepository } from '../../../src/rss/repository/rss.repository';
import { RssAcceptFixture } from '../../fixture/rssAccept.fixture';
import { ReadFeedPaginationRequestDto } from '../../../src/feed/dto/request/readFeedPagination.dto';

describe('GET api/feed E2E Test', () => {
  let app: INestApplication;
  const latestId = 20;

  beforeAll(async () => {
    app = global.testApp;
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

  it('[200] lastId가 없으면 최신 피드부터 전송한다.', async () => {
    //given
    const feedPaginationQueryDto = new ReadFeedPaginationRequestDto({
      limit: 5,
    });

    //when
    const response = await request(app.getHttpServer())
      .get('/api/feed')
      .query(feedPaginationQueryDto);

    //then
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

  it('[200] lastId가 있으면 해당 피드 다음 순서부터 전송한다.', async () => {
    //given
    const feedPaginationQueryDto = new ReadFeedPaginationRequestDto({
      limit: 5,
      lastId: 11,
    });

    //when
    const response = await request(app.getHttpServer())
      .get('/api/feed')
      .query(feedPaginationQueryDto);

    //then
    expect(response.status).toBe(HttpStatus.OK);
    expect(response.body.data.result.map((feed) => feed.id)).toStrictEqual([
      feedPaginationQueryDto.lastId - 1,
      feedPaginationQueryDto.lastId - 2,
      feedPaginationQueryDto.lastId - 3,
      feedPaginationQueryDto.lastId - 4,
      feedPaginationQueryDto.lastId - 5,
    ]);
    expect(response.body.data.hasMore).toBe(true);
    expect(response.body.data.lastId).toBe(6);
  });

  it('[200] limit의 크기보다 남은 Feed의 개수가 적은 경우면 정상적으로 동작한다.', async () => {
    //given
    const feedPaginationQueryDto = new ReadFeedPaginationRequestDto({
      limit: 15,
      lastId: 10,
    });

    //when
    const response = await request(app.getHttpServer())
      .get('/api/feed')
      .query(feedPaginationQueryDto);

    //then
    expect(response.status).toBe(HttpStatus.OK);
    expect(response.body.data.result.map((feed) => feed.id)).toStrictEqual([
      feedPaginationQueryDto.lastId - 1,
      feedPaginationQueryDto.lastId - 2,
      feedPaginationQueryDto.lastId - 3,
      feedPaginationQueryDto.lastId - 4,
      feedPaginationQueryDto.lastId - 5,
      feedPaginationQueryDto.lastId - 6,
      feedPaginationQueryDto.lastId - 7,
      feedPaginationQueryDto.lastId - 8,
      feedPaginationQueryDto.lastId - 9,
    ]);
    expect(response.body.data.hasMore).toBe(false);
    expect(response.body.data.lastId).toBe(1);
  });

  it('[200] 남은 피드 개수가 0이면 lastId 0, 빈 배열로 응답한다.', async () => {
    //given
    const feedPaginationQueryDto = new ReadFeedPaginationRequestDto({
      limit: 15,
      lastId: 1,
    });

    //when
    const response = await request(app.getHttpServer())
      .get('/api/feed')
      .query(feedPaginationQueryDto);

    //then
    expect(response.status).toBe(HttpStatus.OK);
    expect(response.body.data.result.map((feed) => feed.id)).toStrictEqual([]);
    expect(response.body.data.hasMore).toBe(false);
    expect(response.body.data.lastId).toBe(0);
  });
});
