import { HttpStatus } from '@nestjs/common';

import supertest from 'supertest';
import TestAgent from 'supertest/lib/agent';

import { RssBlockRepository } from '@block/repository/rssBlock.repository';

import { FeedRepository } from '@feed/repository/feed.repository';

import { RssAccept } from '@rss/entity/rss.entity';
import { RssAcceptRepository } from '@rss/repository/rss.repository';

import { SubscriptionRepository } from '@subscribe/repository/subscription.repository';

import { Tag } from '@tag/entity/tag.entity';
import { TagRepository } from '@tag/repository/tag.repository';

import { User } from '@user/entity/user.entity';
import { UserRepository } from '@user/repository/user.repository';

import { FeedFixture } from '@test/config/common/fixture/feed.fixture';
import { RssAcceptFixture } from '@test/config/common/fixture/rss-accept.fixture';
import { TagFixture } from '@test/config/common/fixture/tag.fixture';
import { UserFixture } from '@test/config/common/fixture/user.fixture';
import { createAccessToken, testApp } from '@test/config/e2e/env/jest.setup';

const URL = '/api/feeds/subscriptions';

type SubscriptionFeedBody = {
  data: {
    result: { id: number; blog: { name: string }; tag: string[] }[];
    hasMore: boolean;
    lastId: number;
  };
};

describe(`GET ${URL} E2E Test`, () => {
  let agent: TestAgent;
  let userRepository: UserRepository;
  let rssAcceptRepository: RssAcceptRepository;
  let feedRepository: FeedRepository;
  let tagRepository: TagRepository;
  let subscriptionRepository: SubscriptionRepository;
  let user: User;
  let subscribedBlog: RssAccept;
  let otherBlog: RssAccept;
  let accessToken: string;
  let tag: Tag;

  beforeAll(() => {
    agent = supertest(testApp.getHttpServer());
    userRepository = testApp.get(UserRepository);
    rssAcceptRepository = testApp.get(RssAcceptRepository);
    feedRepository = testApp.get(FeedRepository);
    tagRepository = testApp.get(TagRepository);
    subscriptionRepository = testApp.get(SubscriptionRepository);
  });

  beforeEach(async () => {
    user = await userRepository.save(
      await UserFixture.createUserCryptFixture(),
    );
    accessToken = createAccessToken(user);

    subscribedBlog = await rssAcceptRepository.save(
      RssAcceptFixture.createRssAcceptFixture(),
    );
    otherBlog = await rssAcceptRepository.save(
      RssAcceptFixture.createRssAcceptFixture(),
    );
    tag = await tagRepository.save(TagFixture.createTagFixture());
  });

  it('[401] 비로그인 시 구독 피드 조회에 실패한다.', async () => {
    const response = await agent.get(URL);
    expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
  });

  it('[200] 구독한 블로그가 없으면 빈 결과를 반환한다.', async () => {
    const response = await agent
      .get(URL)
      .set('Authorization', `Bearer ${accessToken}`);

    expect(response.status).toBe(HttpStatus.OK);
    const { data } = response.body as SubscriptionFeedBody;
    expect(data.result).toEqual([]);
    expect(data.hasMore).toBe(false);
    expect(data.lastId).toBe(0);
  });

  it('[200] 구독한 블로그의 공개 게시글만 반환하고 비공개·미구독 블로그는 제외한다.', async () => {
    // given: 구독 블로그(공개 2 + 태그, 비공개 1), 미구독 블로그(공개 1)
    const taggedFeed = FeedFixture.createFeedFixture(subscribedBlog, {
      isPublic: true,
    });
    taggedFeed.tags = [tag];
    await feedRepository.save(taggedFeed);
    await feedRepository.save(
      FeedFixture.createFeedFixture(subscribedBlog, { isPublic: true }),
    );
    await feedRepository.save(
      FeedFixture.createFeedFixture(subscribedBlog, { isPublic: false }),
    );
    await feedRepository.save(
      FeedFixture.createFeedFixture(otherBlog, { isPublic: true }),
    );

    await subscriptionRepository.insert({ user, rssAccept: subscribedBlog });

    // when
    const response = await agent
      .get(URL)
      .set('Authorization', `Bearer ${accessToken}`);

    // then
    expect(response.status).toBe(HttpStatus.OK);
    const { result } = (response.body as SubscriptionFeedBody).data;
    expect(result).toHaveLength(2);
    expect(
      result.every((feed) => feed.blog.name === subscribedBlog.name),
    ).toBe(true);
    const taggedResult = result.find((feed) => feed.tag.length > 0);
    expect(taggedResult.tag).toContain(tag.name);
  });

  it('[200] limit 기반 커서 페이지네이션이 동작한다.', async () => {
    const feeds = await feedRepository.save(
      Array.from({ length: 3 }).map(() =>
        FeedFixture.createFeedFixture(subscribedBlog, { isPublic: true }),
      ),
    );
    await subscriptionRepository.insert({ user, rssAccept: subscribedBlog });

    // 첫 페이지 (limit=2 → hasMore=true)
    const firstPage = await agent
      .get(URL)
      .query({ limit: 2 })
      .set('Authorization', `Bearer ${accessToken}`);

    expect(firstPage.status).toBe(HttpStatus.OK);
    const firstPageData = (firstPage.body as SubscriptionFeedBody).data;
    expect(firstPageData.result).toHaveLength(2);
    expect(firstPageData.hasMore).toBe(true);

    // 다음 페이지
    const secondPage = await agent
      .get(URL)
      .query({ limit: 2, lastId: firstPageData.lastId })
      .set('Authorization', `Bearer ${accessToken}`);

    expect(secondPage.status).toBe(HttpStatus.OK);
    const secondPageData = (secondPage.body as SubscriptionFeedBody).data;
    expect(secondPageData.result).toHaveLength(1);
    expect(secondPageData.hasMore).toBe(false);
    // 전체 3개 ID가 중복 없이 반환되었는지
    const ids = [
      ...firstPageData.result.map((f) => f.id),
      ...secondPageData.result.map((f) => f.id),
    ];
    expect(new Set(ids).size).toBe(3);
    expect(ids.sort()).toEqual(feeds.map((f) => f.id).sort());
  });

  it('[200] 구독 중이어도 차단한 RSS의 게시글은 구독 피드에서 제외된다.', async () => {
    // given - 두 블로그 모두 구독, 한 블로그는 차단
    const rssBlockRepository = testApp.get(RssBlockRepository);
    await feedRepository.save(
      FeedFixture.createFeedFixture(subscribedBlog, { isPublic: true }),
    );
    await feedRepository.save(
      FeedFixture.createFeedFixture(otherBlog, { isPublic: true }),
    );
    await subscriptionRepository.insert({ user, rssAccept: subscribedBlog });
    await subscriptionRepository.insert({ user, rssAccept: otherBlog });
    await rssBlockRepository.save({
      blocker: { id: user.id },
      blockedRss: { id: otherBlog.id },
    });

    // when
    const response = await agent
      .get(URL)
      .set('Authorization', `Bearer ${accessToken}`);

    // then
    expect(response.status).toBe(HttpStatus.OK);
    const { result } = (response.body as SubscriptionFeedBody).data;
    expect(result).toHaveLength(1);
    expect(result[0].blog.name).toBe(subscribedBlog.name);
  });
});
