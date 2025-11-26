import { HttpStatus, INestApplication } from '@nestjs/common';
import * as supertest from 'supertest';
import { FeedFixture } from '../../fixture/feed.fixture';
import { FeedRepository } from '../../../src/feed/repository/feed.repository';
import { RssAcceptRepository } from '../../../src/rss/repository/rss.repository';
import { RssAcceptFixture } from '../../fixture/rss-accept.fixture';
import { ReadFeedPaginationRequestDto } from '../../../src/feed/dto/request/readFeedPagination.dto';
import TestAgent from 'supertest/lib/agent';
import { Feed } from '../../../src/feed/entity/feed.entity';

const URL = '/api/feed';

describe(`GET ${URL}?limit={}&lastId={} E2E Test`, () => {
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
    const feeds = Array.from({ length: 10 }).map((_, i) =>
      FeedFixture.createFeedFixture(rssAccept, _, i + 1),
    );

    // 최신 게시글부터 제공하기에 테스트 편의성을 위해 최신 게시글을 앞으로
    feedList = (await feedRepository.save(feeds)).reverse();
  });

  it('[200] 마지막 수신 피드 ID가 없을 경우 최신 피드부터 피드 목록 제공을 성공한다.', async () => {
    // given
    const requestDto = new ReadFeedPaginationRequestDto({
      limit: 5,
    });

    // when
    const response = await agent.get(URL).query(requestDto);

    // then
    const { data } = response.body;
    expect(response.status).toBe(HttpStatus.OK);
    expect(data).toStrictEqual({
      result: Array.from({ length: requestDto.limit }).map((_, i) => {
        const index = 0 + i;
        const feed = feedList[index];

        return {
          id: feed.id,
          author: feed.blog.name,
          blogPlatform: feed.blog.blogPlatform,
          title: feed.title,
          path: feed.path,
          createdAt: feed.createdAt.toISOString(),
          thumbnail: feed.thumbnail,
          viewCount: feed.viewCount,
          tag: [],
          likes: feed.likeCount,
          comments: feed.commentCount,
          isNew: false,
        };
      }),
      lastId: feedList[requestDto.limit - 1].id,
      hasMore: true,
    });
  });

  it('[200] 마지막 수신 피드 ID가 있을 경우 마지막 수신 피드 이후의 피드 목록 제공을 성공한다.', async () => {
    // given
    const requestDto = new ReadFeedPaginationRequestDto({
      limit: 3,
      lastId: feedList[3].id,
    });

    // when
    const response = await agent.get(URL).query(requestDto);

    // then
    const { data } = response.body;
    expect(response.status).toBe(HttpStatus.OK);
    expect(data).toStrictEqual({
      result: Array.from({ length: requestDto.limit }).map((_, i) => {
        const index = 4 + i;
        const feed = feedList[index];

        return {
          id: feed.id,
          author: feed.blog.name,
          blogPlatform: feed.blog.blogPlatform,
          title: feed.title,
          path: feed.path,
          createdAt: feed.createdAt.toISOString(),
          thumbnail: feed.thumbnail,
          viewCount: feed.viewCount,
          tag: [],
          likes: feed.likeCount,
          comments: feed.commentCount,
          isNew: false,
        };
      }),
      lastId: feedList[6].id,
      hasMore: true,
    });
  });

  it('[200] 받고자 하는 수신 피드 개수가 남은 피드 개수보다 많을 경우 남은 모든 피드 목록 제공을 성공한다.', async () => {
    // given
    const requestDto = new ReadFeedPaginationRequestDto({
      limit: 10,
      lastId: feedList[5].id,
    });

    // when
    const response = await agent.get(URL).query(requestDto);

    // then
    const { data } = response.body;
    expect(response.status).toBe(HttpStatus.OK);
    expect(data).toStrictEqual({
      result: Array.from({ length: requestDto.limit })
        .map((_, i) => {
          const index = 6 + i;
          const feed = feedList[index];

          return !feed
            ? null
            : {
                id: feed.id,
                author: feed.blog.name,
                blogPlatform: feed.blog.blogPlatform,
                title: feed.title,
                path: feed.path,
                createdAt: feed.createdAt.toISOString(),
                thumbnail: feed.thumbnail,
                viewCount: feed.viewCount,
                tag: [],
                likes: feed.likeCount,
                comments: feed.commentCount,
                isNew: false,
              };
        })
        .filter((value) => value),
      lastId: feedList[feedList.length - 1].id,
      hasMore: false,
    });
  });

  it('[200] 남은 피드 개수가 없을 경우 빈 배열과 마지막 피드 ID를 0으로 제공을 성공한다.', async () => {
    // given
    const requestDto = new ReadFeedPaginationRequestDto({
      limit: 15,
      lastId: feedList[feedList.length - 1].id,
    });

    // when
    const response = await agent.get(URL).query(requestDto);

    // then
    const { data } = response.body;
    expect(response.status).toBe(HttpStatus.OK);
    expect(data).toStrictEqual({
      result: [],
      lastId: 0,
      hasMore: false,
    });
  });
});
