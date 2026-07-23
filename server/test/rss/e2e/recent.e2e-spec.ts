import { HttpStatus } from '@nestjs/common';

import supertest from 'supertest';
import TestAgent from 'supertest/lib/agent';

import { FeedRepository } from '@feed/repository/feed.repository';

import { GetRecentRssResponseDto } from '@rss/dto/response/getRecentRss.dto';
import { RssAcceptRepository } from '@rss/repository/rss.repository';

import { FeedFixture } from '@test/config/common/fixture/feed.fixture';
import { RssAcceptFixture } from '@test/config/common/fixture/rss-accept.fixture';
import { testApp } from '@test/config/e2e/env/jest.setup';

const URL = '/api/rss/recent';

describe(`GET ${URL} E2E Test`, () => {
  let agent: TestAgent;
  let rssAcceptRepository: RssAcceptRepository;
  let feedRepository: FeedRepository;

  beforeAll(() => {
    agent = supertest(testApp.getHttpServer());
    rssAcceptRepository = testApp.get(RssAcceptRepository);
    feedRepository = testApp.get(FeedRepository);
  });

  const createRssWithFeed = async (
    createdAt: Date,
    isPublic: boolean = true,
  ) => {
    const rssAccept = await rssAcceptRepository.save(
      RssAcceptFixture.createRssAcceptFixture(),
    );
    const feed = await feedRepository.save(
      FeedFixture.createFeedFixture(rssAccept, { createdAt, isPublic }),
    );
    return { rssAccept, feed };
  };

  it('[200] 최신 공개 게시글 발행 순서대로 RSS 목록을 반환한다.', async () => {
    // given
    const { rssAccept: oldRss } = await createRssWithFeed(
      new Date('2025-12-01'),
    );
    const { rssAccept: newRss, feed: newFeed } = await createRssWithFeed(
      new Date('2025-12-10'),
    );

    // when
    const response = await agent.get(URL);

    // then
    expect(response.status).toBe(HttpStatus.OK);
    const { data }: { data: GetRecentRssResponseDto[] } = response.body;
    const ids = data.map((rss) => rss.id);
    expect(ids.indexOf(newRss.id)).toBeLessThan(ids.indexOf(oldRss.id));
    expect(data[0]).toEqual({
      id: newRss.id,
      name: newRss.name,
      blogPlatform: newRss.blogPlatform,
      lastPublishedAt: expect.any(String),
      latestFeedId: newFeed.id,
    });
  });

  it('[200] 게시글이 여러 개면 가장 최근 공개 게시글의 Feed ID를 반환한다.', async () => {
    // given
    const { rssAccept, feed: oldFeed } = await createRssWithFeed(
      new Date('2025-12-01'),
    );
    const latestFeed = await feedRepository.save(
      FeedFixture.createFeedFixture(rssAccept, {
        createdAt: new Date('2025-12-10'),
      }),
    );
    await feedRepository.save(
      FeedFixture.createFeedFixture(rssAccept, {
        createdAt: new Date('2025-12-15'),
        isPublic: false,
      }),
    );

    // when
    const response = await agent.get(URL);

    // then
    expect(response.status).toBe(HttpStatus.OK);
    const { data }: { data: GetRecentRssResponseDto[] } = response.body;
    const target = data.find((rss) => rss.id === rssAccept.id);
    expect(target.latestFeedId).toBe(latestFeed.id);
    expect(target.latestFeedId).not.toBe(oldFeed.id);
  });

  it('[200] 비공개 게시글만 있는 RSS는 목록에 포함하지 않는다.', async () => {
    // given
    const { rssAccept: privateRss } = await createRssWithFeed(
      new Date('2025-12-10'),
      false,
    );

    // when
    const response = await agent.get(URL);

    // then
    expect(response.status).toBe(HttpStatus.OK);
    const { data }: { data: GetRecentRssResponseDto[] } = response.body;
    expect(data.map((rss) => rss.id)).not.toContain(privateRss.id);
  });

  it('[200] 목록은 최대 10개까지만 반환한다.', async () => {
    // given
    for (let i = 0; i < 12; i++) {
      await createRssWithFeed(
        new Date(new Date('2025-12-01').getTime() + i * 60 * 60 * 1000),
      );
    }

    // when
    const response = await agent.get(URL);

    // then
    expect(response.status).toBe(HttpStatus.OK);
    const { data }: { data: GetRecentRssResponseDto[] } = response.body;
    expect(data.length).toBe(10);
  });
});
