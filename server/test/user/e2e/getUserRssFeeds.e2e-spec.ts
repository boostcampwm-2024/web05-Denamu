import { HttpStatus } from '@nestjs/common';

import supertest from 'supertest';
import TestAgent from 'supertest/lib/agent';

import { Feed } from '@feed/entity/feed.entity';
import { FeedRepository } from '@feed/repository/feed.repository';

import { RssAccept } from '@rss/entity/rss.entity';
import { RssAcceptRepository } from '@rss/repository/rss.repository';

import { GetUserRssFeedsResponseDto } from '@user/dto/response/getUserRssFeeds.dto';

import { FeedFixture } from '@test/config/common/fixture/feed.fixture';
import { RssAcceptFixture } from '@test/config/common/fixture/rss-accept.fixture';
import { testApp } from '@test/config/e2e/env/jest.setup';

const BASE_URL = '/api/users';

describe(`GET ${BASE_URL}/:id/rss/:rssId/feeds E2E Test`, () => {
  let agent: TestAgent;
  let rssAcceptRepository: RssAcceptRepository;
  let feedRepository: FeedRepository;
  let rssAccept: RssAccept;
  let feeds: Feed[];

  beforeAll(() => {
    agent = supertest(testApp.getHttpServer());
    rssAcceptRepository = testApp.get(RssAcceptRepository);
    feedRepository = testApp.get(FeedRepository);
  });

  beforeEach(async () => {
    rssAccept = await rssAcceptRepository.save(
      RssAcceptFixture.createRssAcceptFixture(),
    );

    // id 오름차순으로 게시글 3개 저장 (commentCount 구별)
    feeds = [];
    for (let i = 0; i < 3; i++) {
      feeds.push(
        await feedRepository.save(
          FeedFixture.createFeedFixture(rssAccept, {
            title: `feed ${i + 1}`,
            commentCount: i + 1,
          }),
        ),
      );
    }
  });

  it('[200] RSS의 게시글을 작성일/댓글 수와 함께 최신순(id DESC)으로 조회한다.', async () => {
    // Http when
    const response = await agent.get(
      `${BASE_URL}/1/rss/${rssAccept.id}/feeds`,
    );

    // Http then
    const { data }: { data: GetUserRssFeedsResponseDto } = response.body;
    expect(response.status).toBe(HttpStatus.OK);
    expect(data.hasMore).toBe(false);
    expect(data.lastId).toBe(feeds[0].id);
    expect(data.result).toStrictEqual(
      [...feeds].reverse().map((feed) => ({
        id: feed.id,
        title: feed.title,
        path: feed.path,
        createdAt: feed.createdAt.toISOString(),
        commentCount: feed.commentCount,
        likeCount: feed.likeCount,
      })),
    );
  });

  it('[200] limit으로 페이지 크기를 제한하고 hasMore와 커서(lastId)를 반환한다.', async () => {
    // Http when
    const response = await agent.get(
      `${BASE_URL}/1/rss/${rssAccept.id}/feeds?limit=2`,
    );

    // Http then
    const { data }: { data: GetUserRssFeedsResponseDto } = response.body;
    expect(response.status).toBe(HttpStatus.OK);
    expect(data.result).toHaveLength(2);
    expect(data.hasMore).toBe(true);
    expect(data.result[0].id).toBe(feeds[2].id);
    expect(data.lastId).toBe(feeds[1].id);
  });

  it('[200] lastId 커서 이후의 게시글만 조회한다.', async () => {
    // Http when
    const response = await agent.get(
      `${BASE_URL}/1/rss/${rssAccept.id}/feeds?lastId=${feeds[1].id}`,
    );

    // Http then
    const { data }: { data: GetUserRssFeedsResponseDto } = response.body;
    expect(response.status).toBe(HttpStatus.OK);
    expect(data.result).toHaveLength(1);
    expect(data.result[0].id).toBe(feeds[0].id);
    expect(data.hasMore).toBe(false);
  });

  it('[200] 게시글이 없는 RSS는 빈 목록과 lastId=0을 반환한다.', async () => {
    // Http given
    const emptyRss = await rssAcceptRepository.save(
      RssAcceptFixture.createRssAcceptFixture(),
    );

    // Http when
    const response = await agent.get(
      `${BASE_URL}/1/rss/${emptyRss.id}/feeds`,
    );

    // Http then
    const { data }: { data: GetUserRssFeedsResponseDto } = response.body;
    expect(response.status).toBe(HttpStatus.OK);
    expect(data.result).toStrictEqual([]);
    expect(data.lastId).toBe(0);
    expect(data.hasMore).toBe(false);
  });
});
