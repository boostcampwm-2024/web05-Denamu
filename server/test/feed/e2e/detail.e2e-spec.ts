import { TagRepository } from './../../../src/tag/repository/tag.repository';
import { HttpStatus, INestApplication } from '@nestjs/common';
import * as supertest from 'supertest';
import { FeedFixture } from '../../fixture/feed.fixture';
import { FeedRepository } from '../../../src/feed/repository/feed.repository';
import { RssAcceptRepository } from '../../../src/rss/repository/rss.repository';
import { RssAcceptFixture } from '../../fixture/rss-accept.fixture';
import { ManageFeedRequestDto } from '../../../src/feed/dto/request/manageFeed.dto';
import TestAgent from 'supertest/lib/agent';
import { Feed } from '../../../src/feed/entity/feed.entity';
import { TagFixture } from '../../fixture/tag.fixture';

const URL = '/api/feed/detail';

describe(`GET ${URL}/{feedId} E2E Test`, () => {
  let app: INestApplication;
  let agent: TestAgent;
  let feedList: Feed[];

  beforeAll(async () => {
    app = global.testApp;
    agent = supertest(app.getHttpServer());
    const feedRepository = app.get(FeedRepository);
    const rssAcceptRepository = app.get(RssAcceptRepository);
    const tagRepository = app.get(TagRepository);
    const rssAccept = await rssAcceptRepository.save(
      RssAcceptFixture.createRssAcceptFixture(),
    );

    feedList = Array.from({ length: 2 }).map((_, i) =>
      FeedFixture.createFeedFixture(rssAccept, _, i + 1),
    );
    const tag = await tagRepository.save(TagFixture.createTagFixture());
    feedList[0].tags = [tag];

    feedList = await feedRepository.save(feedList);
  });

  it('[404] 존재하지 않는 피드 ID로 요청할 경우 게시글 상세 조회에 실패한다.', async () => {
    // given
    const feedDetailRequestDto = new ManageFeedRequestDto({
      feedId: Number.MAX_SAFE_INTEGER,
    });

    // when
    const response = await agent.get(`${URL}/${feedDetailRequestDto.feedId}`);

    // then
    expect(response.status).toBe(HttpStatus.NOT_FOUND);
  });

  it('[200] 존재하는 피드 ID로 요청할 경우 게시글 상세 조회에 성공한다.', async () => {
    // given
    const feedDetailRequestDto = new ManageFeedRequestDto({
      feedId: feedList[0].id,
    });

    // when
    const response = await agent.get(`${URL}/${feedDetailRequestDto.feedId}`);

    // then
    const { data } = response.body;
    expect(response.status).toBe(HttpStatus.OK);
    expect(data).toStrictEqual({
      author: 'blog1',
      blogPlatform: 'etc',
      comments: 0,
      createdAt: '2025-11-21T01:00:00.000Z',
      id: feedList[0].id,
      likes: 0,
      path: 'https://test.com/test1',
      summary: 'test summary 1',
      tag: ['test'],
      thumbnail: 'https://test.com/test1.png',
      title: 'test1',
      viewCount: 1,
    });
  });

  it('[200] 태그가 없는 게시글로 요청할 경우 게시글 상세 조회에 성공한다.', async () => {
    // given
    const feedDetailRequestDto = new ManageFeedRequestDto({
      feedId: feedList[1].id,
    });
    // when
    const response = await agent.get(`${URL}/${feedDetailRequestDto.feedId}`);

    // then
    const { data } = response.body;
    expect(response.status).toBe(HttpStatus.OK);
    expect(data).toStrictEqual({
      author: 'blog1',
      blogPlatform: 'etc',
      comments: 0,
      createdAt: '2025-11-21T02:00:00.000Z',
      id: feedList[1].id,
      likes: 0,
      path: 'https://test.com/test2',
      summary: 'test summary 2',
      tag: [],
      thumbnail: 'https://test.com/test2.png',
      title: 'test2',
      viewCount: 1,
    });
  });
});
