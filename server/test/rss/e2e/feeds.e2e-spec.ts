import { HttpStatus } from '@nestjs/common';

import supertest from 'supertest';
import TestAgent from 'supertest/lib/agent';

import { Feed } from '@feed/entity/feed.entity';
import { FeedRepository } from '@feed/repository/feed.repository';

import { GetRssFeedsResponseDto } from '@rss/dto/response/getRssFeeds.dto';
import { RssAccept } from '@rss/entity/rss.entity';
import { RssAcceptRepository } from '@rss/repository/rss.repository';

import { FeedFixture } from '@test/config/common/fixture/feed.fixture';
import { RssAcceptFixture } from '@test/config/common/fixture/rss-accept.fixture';
import { testApp } from '@test/config/e2e/env/jest.setup';

const makeURL = (id: number | string) => `/api/rss/${id}/feeds`;

describe(`GET /api/rss/:rssId/feeds E2E Test`, () => {
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

    // 공개 3개 + 비공개 1개
    feeds = [];
    for (let i = 0; i < 3; i++) {
      feeds.push(
        await feedRepository.save(
          FeedFixture.createFeedFixture(rssAccept, {
            title: `feed ${i + 1}`,
            isPublic: true,
          }),
        ),
      );
    }
    await feedRepository.save(
      FeedFixture.createFeedFixture(rssAccept, { isPublic: false }),
    );
  });

  it('[404] 존재하지 않는 RSS의 게시글은 조회할 수 없다.', async () => {
    const response = await agent.get(makeURL(999999));
    expect(response.status).toBe(HttpStatus.NOT_FOUND);
  });

  it('[200] 공개 게시글만 썸네일과 함께 최신순(id DESC)으로 조회한다.', async () => {
    const response = await agent.get(makeURL(rssAccept.id));

    expect(response.status).toBe(HttpStatus.OK);
    const { data }: { data: GetRssFeedsResponseDto } = response.body;
    expect(data.result).toHaveLength(3);
    expect(data.hasMore).toBe(false);
    expect(data.lastId).toBe(feeds[0].id);
    expect(data.result[0].id).toBe(feeds[2].id);
    expect(data.result[0]).toHaveProperty('thumbnail');
    expect(data.result[0].thumbnail).toBe(feeds[2].thumbnail);
  });

  it('[200] limit으로 페이지 크기를 제한하고 hasMore와 커서(lastId)를 반환한다.', async () => {
    const response = await agent.get(`${makeURL(rssAccept.id)}?limit=2`);

    expect(response.status).toBe(HttpStatus.OK);
    const { data }: { data: GetRssFeedsResponseDto } = response.body;
    expect(data.result).toHaveLength(2);
    expect(data.hasMore).toBe(true);
    expect(data.lastId).toBe(feeds[1].id);
  });

  it('[200] date로 해당 날짜에 발행된 게시글만 조회한다.', async () => {
    const targetFeed = await feedRepository.save(
      FeedFixture.createFeedFixture(rssAccept, {
        title: 'target day feed',
        isPublic: true,
        createdAt: new Date('2025-06-10T09:00:00'),
      }),
    );
    await feedRepository.save(
      FeedFixture.createFeedFixture(rssAccept, {
        title: 'other day feed',
        isPublic: true,
        createdAt: new Date('2025-06-11T09:00:00'),
      }),
    );

    const response = await agent.get(`${makeURL(rssAccept.id)}?date=2025-06-10`);

    expect(response.status).toBe(HttpStatus.OK);
    const { data }: { data: GetRssFeedsResponseDto } = response.body;
    expect(data.result).toHaveLength(1);
    expect(data.result[0].id).toBe(targetFeed.id);
    expect(data.hasMore).toBe(false);
  });

  it('[400] date 형식이 잘못되면 400을 반환한다.', async () => {
    const response = await agent.get(`${makeURL(rssAccept.id)}?date=2025/06/10`);
    expect(response.status).toBe(HttpStatus.BAD_REQUEST);
  });
});
