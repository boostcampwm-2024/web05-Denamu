import { TagRepository } from './../../../src/tag/repository/tag.repository';
import { HttpStatus } from '@nestjs/common';
import * as supertest from 'supertest';
import { FeedFixture } from '../../config/common/fixture/feed.fixture';
import { FeedRepository } from '../../../src/feed/repository/feed.repository';
import { RssAcceptRepository } from '../../../src/rss/repository/rss.repository';
import { RssAcceptFixture } from '../../config/common/fixture/rss-accept.fixture';
import { ManageFeedRequestDto } from '../../../src/feed/dto/request/manageFeed.dto';
import TestAgent from 'supertest/lib/agent';
import { Feed } from '../../../src/feed/entity/feed.entity';
import { TagFixture } from '../../config/common/fixture/tag.fixture';
import { RssAccept } from '../../../src/rss/entity/rss.entity';
import { Tag } from '../../../src/tag/entity/tag.entity';
import { testApp } from '../../config/e2e/env/jest.setup';

const URL = '/api/feed/detail';

describe(`GET ${URL}/{feedId} E2E Test`, () => {
  let agent: TestAgent;
  let feedList: Feed[];
  let rssAccept: RssAccept;
  let tag: Tag;
  let feedRepository: FeedRepository;
  let rssAcceptRepository: RssAcceptRepository;
  let tagRepository: TagRepository;

  beforeAll(() => {
    agent = supertest(testApp.getHttpServer());
    feedRepository = testApp.get(FeedRepository);
    rssAcceptRepository = testApp.get(RssAcceptRepository);
    tagRepository = testApp.get(TagRepository);
  });

  beforeEach(async () => {
    rssAccept = await rssAcceptRepository.save(
      RssAcceptFixture.createRssAcceptFixture(),
    );

    const feeds = Array.from({ length: 2 }).map(() =>
      FeedFixture.createFeedFixture(rssAccept),
    );
    tag = await tagRepository.save(TagFixture.createTagFixture());
    feeds[0].tags = [tag];

    feedList = await feedRepository.save(feeds);
  });

  it('[404] 존재하지 않는 피드 ID로 요청할 경우 게시글 상세 조회에 실패한다.', async () => {
    // given
    const feedDetailRequestDto = new ManageFeedRequestDto({
      feedId: Number.MAX_SAFE_INTEGER,
    });

    // Http when
    const response = await agent.get(`${URL}/${feedDetailRequestDto.feedId}`);

    // Http then
    const { data } = response.body;
    expect(response.status).toBe(HttpStatus.NOT_FOUND);
    expect(data).toBeUndefined();
  });

  it('[200] 존재하는 피드 ID로 요청할 경우 게시글 상세 조회에 성공한다.', async () => {
    // given
    const feedDetailRequestDto = new ManageFeedRequestDto({
      feedId: feedList[0].id,
    });

    // Http when
    const response = await agent.get(`${URL}/${feedDetailRequestDto.feedId}`);

    // Http then
    const { data } = response.body;
    expect(response.status).toBe(HttpStatus.OK);
    expect(data).toStrictEqual({
      author: feedList[0].blog.name,
      blogPlatform: 'etc',
      comments: feedList[0].commentCount,
      createdAt: feedList[0].createdAt.toISOString(),
      id: feedList[0].id,
      likes: feedList[0].likeCount,
      path: feedList[0].path,
      summary: feedList[0].summary,
      tag: feedList[0].tags.map((tag) => tag.name),
      thumbnail: feedList[0].thumbnail,
      title: feedList[0].title,
      viewCount: feedList[0].viewCount,
    });
  });

  it('[200] 태그가 없는 게시글로 요청할 경우 게시글 상세 조회에 성공한다.', async () => {
    // given
    const feedDetailRequestDto = new ManageFeedRequestDto({
      feedId: feedList[1].id,
    });

    // Http when
    const response = await agent.get(`${URL}/${feedDetailRequestDto.feedId}`);

    // Http then
    const { data } = response.body;
    expect(response.status).toBe(HttpStatus.OK);
    expect(data).toStrictEqual({
      author: feedList[1].blog.name,
      blogPlatform: feedList[1].blog.blogPlatform,
      comments: feedList[1].commentCount,
      createdAt: feedList[1].createdAt.toISOString(),
      id: feedList[1].id,
      likes: feedList[1].likeCount,
      path: feedList[1].path,
      summary: feedList[1].summary,
      tag: [],
      thumbnail: feedList[1].thumbnail,
      title: feedList[1].title,
      viewCount: feedList[1].viewCount,
    });
  });
});
