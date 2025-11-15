import { HttpStatus, INestApplication } from '@nestjs/common';
import * as supertest from 'supertest';
import { FeedRepository } from '../../../src/feed/repository/feed.repository';
import { RssAcceptRepository } from '../../../src/rss/repository/rss.repository';
import { RssAcceptFixture } from '../../fixture/rss-accept.fixture';
import { FeedFixture } from '../../fixture/feed.fixture';
import {
  SearchFeedRequestDto,
  SearchType,
} from '../../../src/feed/dto/request/searchFeed.dto';
import TestAgent from 'supertest/lib/agent';

describe('GET /api/feed/search', () => {
  let app: INestApplication;
  let agent: TestAgent;

  beforeAll(async () => {
    app = global.testApp;
    agent = supertest(app.getHttpServer());
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

  it('[200] 검색 결과에 적합한 게시글이 존재할 경우 검색 결과 제공을 성공한다.', async () => {
    // given
    const requestDto = new SearchFeedRequestDto({
      type: SearchType.TITLE,
      find: 'test',
    });

    // when
    const response = await agent.get('/api/feed/search').query(requestDto);

    // then
    expect(response.status).toBe(HttpStatus.OK);
  });

  it('[200] 검색 결과에 적합한 게시글이 없을 경우 빈 배열 제공을 성공한다.', async () => {
    // given
    const requestDto = new SearchFeedRequestDto({
      type: SearchType.TITLE,
      find: 'null',
    });

    // when
    const response = await agent.get('/api/feed/search').query(requestDto);

    // then
    expect(response.status).toBe(HttpStatus.OK);
  });
});
