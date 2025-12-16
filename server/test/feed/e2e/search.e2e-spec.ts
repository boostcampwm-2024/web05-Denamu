import { HttpStatus, INestApplication } from '@nestjs/common';
import * as supertest from 'supertest';
import { FeedRepository } from '../../../src/feed/repository/feed.repository';
import { RssAcceptRepository } from '../../../src/rss/repository/rss.repository';
import { RssAcceptFixture } from '../../config/common/fixture/rss-accept.fixture';
import { FeedFixture } from '../../config/common/fixture/feed.fixture';
import {
  SearchFeedRequestDto,
  SearchType,
} from '../../../src/feed/dto/request/searchFeed.dto';
import TestAgent from 'supertest/lib/agent';
import { Feed } from '../../../src/feed/entity/feed.entity';

const URL = '/api/feed/search';

describe(`GET ${URL}?type={}&find={} E2E Test`, () => {
  let app: INestApplication;
  let agent: TestAgent;
  let feedList: Feed[];

  beforeAll(async () => {
    app = global.testApp;
    agent = supertest(app.getHttpServer());
    const feedRepository = app.get(FeedRepository);
    const rssAcceptRepository = app.get(RssAcceptRepository);
    const rssAccept = await rssAcceptRepository.save(
      RssAcceptFixture.createRssAcceptFixture(),
    );
    const feeds = Array.from({ length: 5 }).map((_, i) =>
      FeedFixture.createFeedFixture(rssAccept, {}, i + 1),
    );

    feedList = (await feedRepository.save(feeds)).reverse();
  });

  it('[200] 검색 결과에 적합한 게시글이 존재할 경우 검색 결과 제공을 성공한다.', async () => {
    // given
    const requestDto = new SearchFeedRequestDto({
      type: SearchType.TITLE,
      find: 'test',
    });

    // Http when
    const response = await agent.get(URL).query(requestDto);

    // Http then
    const { data } = response.body;
    expect(response.status).toBe(HttpStatus.OK);
    expect(data).toStrictEqual({
      totalCount: 5,
      result: Array.from({ length: 4 }).map((_, i) => {
        const feed = feedList[i];
        return {
          id: feed.id,
          blogName: feed.blog.name,
          title: feed.title,
          likes: feed.likeCount,
          comments: feed.commentCount,
          path: feed.path,
          createdAt: feed.createdAt.toISOString(),
        };
      }),
      totalPages: 2,
      limit: 4,
    });
  });

  it('[200] 검색 결과에 적합한 게시글이 없을 경우 빈 배열 제공을 성공한다.', async () => {
    // given
    const requestDto = new SearchFeedRequestDto({
      type: SearchType.TITLE,
      find: 'null',
    });

    // Http when
    const response = await agent.get(URL).query(requestDto);

    // Http then
    const { data } = response.body;
    expect(response.status).toBe(HttpStatus.OK);
    expect(data).toStrictEqual({
      totalCount: 0,
      result: [],
      totalPages: 0,
      limit: 4,
    });
  });
});
