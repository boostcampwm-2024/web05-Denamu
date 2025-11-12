import { HttpStatus, INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { FeedRepository } from '../../../src/feed/repository/feed.repository';
import { RssAcceptRepository } from '../../../src/rss/repository/rss.repository';
import { RssAcceptFixture } from '../../fixture/rss-accept.fixture';
import { FeedFixture } from '../../fixture/feed.fixture';
import {
  SearchFeedRequestDto,
  SearchType,
} from '../../../src/feed/dto/request/searchFeed.dto';

describe('GET /api/feed/search', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = global.testApp;
    const feedRepository = app.get(FeedRepository);
    const rssAcceptRepository = app.get(RssAcceptRepository);

    const blog = await rssAcceptRepository.save(
      RssAcceptFixture.createRssAcceptFixture(),
    );

    const feeds = Array.from({ length: 5 }).map((_, i) => {
      return FeedFixture.createFeedFixture(blog, _, i + 1);
    });

    await feedRepository.insert(feeds);
  });

  it('[200] 검색 결과에 적합한 게시글이 존재할 경우 검색 결과를 반환한다.', async () => {
    // given
    const searchQueryDto = new SearchFeedRequestDto({
      type: SearchType.TITLE,
      find: 'test',
    });

    // when
    const response = await request(app.getHttpServer())
      .get('/api/feed/search')
      .query(searchQueryDto);

    // then
    expect(response.status).toBe(HttpStatus.OK);
  });

  it('[200] 검색 결과에 적합한 게시글이 없더라도 오류를 발생하지 않는다.', async () => {
    // given
    const searchQueryDto = new SearchFeedRequestDto({
      type: SearchType.TITLE,
      find: 'null',
    });

    // when
    const response = await request(app.getHttpServer())
      .get('/api/feed/search')
      .query(searchQueryDto);

    // then
    expect(response.status).toBe(HttpStatus.OK);
  });
});
