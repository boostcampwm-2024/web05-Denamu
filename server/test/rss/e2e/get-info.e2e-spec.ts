import { HttpStatus } from '@nestjs/common';

import supertest from 'supertest';
import TestAgent from 'supertest/lib/agent';

import { RssBlockRepository } from '@block/repository/rssBlock.repository';

import { FeedRepository } from '@feed/repository/feed.repository';

import { GetRssInfoResponseDto } from '@rss/dto/response/getRssInfo.dto';
import { RssAccept } from '@rss/entity/rss.entity';
import { RssAcceptRepository } from '@rss/repository/rss.repository';

import { SubscriptionRepository } from '@subscribe/repository/subscription.repository';

import { UserRepository } from '@user/repository/user.repository';

import { FeedFixture } from '@test/config/common/fixture/feed.fixture';
import { RssAcceptFixture } from '@test/config/common/fixture/rss-accept.fixture';
import { UserFixture } from '@test/config/common/fixture/user.fixture';
import { createAccessToken, testApp } from '@test/config/e2e/env/jest.setup';

const makeURL = (id: number | string) => `/api/rss/${id}`;

describe(`GET /api/rss/:rssId E2E Test`, () => {
  let agent: TestAgent;
  let rssAcceptRepository: RssAcceptRepository;
  let userRepository: UserRepository;
  let feedRepository: FeedRepository;
  let subscriptionRepository: SubscriptionRepository;

  beforeAll(() => {
    agent = supertest(testApp.getHttpServer());
    rssAcceptRepository = testApp.get(RssAcceptRepository);
    userRepository = testApp.get(UserRepository);
    feedRepository = testApp.get(FeedRepository);
    subscriptionRepository = testApp.get(SubscriptionRepository);
  });

  it('[404] 존재하지 않는 RSS는 조회할 수 없다.', async () => {
    const response = await agent.get(makeURL(999999));
    expect(response.status).toBe(HttpStatus.NOT_FOUND);
  });

  it('[200] 소유자 없는 RSS는 owner=null, isOwner=false, isSubscribed=false로 반환한다.', async () => {
    // given (공개 2개 + 비공개 1개)
    const rssAccept = await rssAcceptRepository.save(
      RssAcceptFixture.createRssAcceptFixture(),
    );
    await feedRepository.save(
      FeedFixture.createFeedFixture(rssAccept, { isPublic: true }),
    );
    await feedRepository.save(
      FeedFixture.createFeedFixture(rssAccept, { isPublic: true }),
    );
    await feedRepository.save(
      FeedFixture.createFeedFixture(rssAccept, { isPublic: false }),
    );

    // when
    const response = await agent.get(makeURL(rssAccept.id));

    // then
    expect(response.status).toBe(HttpStatus.OK);
    const { data }: { data: GetRssInfoResponseDto } = response.body;
    expect(data.owner).toBeNull();
    expect(data.isOwner).toBe(false);
    expect(data.isSubscribed).toBe(false);
    expect(data.feedCount).toBe(2);
    expect(data.lastPublishedAt).not.toBeNull();
    expect(data.blogUrl).toBe(rssAccept.blogUrl);
    expect(data).not.toHaveProperty('email');
  });

  it('[200] 소유자 있는 RSS는 owner 정보를 포함하고 email은 노출하지 않는다.', async () => {
    // given
    const owner = await userRepository.save(
      await UserFixture.createUserCryptFixture(),
    );
    const rssAccept = await rssAcceptRepository.save(
      RssAcceptFixture.createRssAcceptFixture({ userId: owner.id }),
    );

    // when (비로그인)
    const response = await agent.get(makeURL(rssAccept.id));

    // then
    expect(response.status).toBe(HttpStatus.OK);
    const { data }: { data: GetRssInfoResponseDto } = response.body;
    expect(data.owner).toEqual({
      id: owner.id,
      userName: owner.userName,
      profileImage: owner.profileImage ?? null,
    });
    expect(data.isOwner).toBe(false);
  });

  it('[200] 로그인한 소유자가 조회하면 isOwner=true를 반환한다.', async () => {
    // given
    const owner = await userRepository.save(
      await UserFixture.createUserCryptFixture(),
    );
    const rssAccept = await rssAcceptRepository.save(
      RssAcceptFixture.createRssAcceptFixture({ userId: owner.id }),
    );
    const accessToken = createAccessToken(owner);

    // when
    const response = await agent
      .get(makeURL(rssAccept.id))
      .set('Authorization', `Bearer ${accessToken}`);

    // then
    expect(response.status).toBe(HttpStatus.OK);
    const { data }: { data: GetRssInfoResponseDto } = response.body;
    expect(data.isOwner).toBe(true);
  });

  it('[200] 구독 중인 사용자가 조회하면 isSubscribed=true를 반환한다.', async () => {
    // given
    const viewer = await userRepository.save(
      await UserFixture.createUserCryptFixture(),
    );
    const rssAccept: RssAccept = await rssAcceptRepository.save(
      RssAcceptFixture.createRssAcceptFixture(),
    );
    await subscriptionRepository.insert({ user: viewer, rssAccept });
    const accessToken = createAccessToken(viewer);

    // when
    const response = await agent
      .get(makeURL(rssAccept.id))
      .set('Authorization', `Bearer ${accessToken}`);

    // then
    expect(response.status).toBe(HttpStatus.OK);
    const { data }: { data: GetRssInfoResponseDto } = response.body;
    expect(data.isSubscribed).toBe(true);
    expect(data.subscriberCount).toBe(1);
  });

  it('[200] 차단한 사용자가 조회하면 isBlocked=true를 반환한다.', async () => {
    // given
    const rssBlockRepository = testApp.get(RssBlockRepository);
    const viewer = await userRepository.save(
      await UserFixture.createUserCryptFixture(),
    );
    const rssAccept: RssAccept = await rssAcceptRepository.save(
      RssAcceptFixture.createRssAcceptFixture(),
    );
    await rssBlockRepository.save({
      blocker: { id: viewer.id },
      blockedRss: { id: rssAccept.id },
    });
    const accessToken = createAccessToken(viewer);

    // when
    const response = await agent
      .get(makeURL(rssAccept.id))
      .set('Authorization', `Bearer ${accessToken}`);

    // then
    expect(response.status).toBe(HttpStatus.OK);
    const { data }: { data: GetRssInfoResponseDto } = response.body;
    expect(data.isBlocked).toBe(true);
  });

  it('[200] 차단하지 않았거나 비로그인으로 조회하면 isBlocked=false를 반환한다.', async () => {
    // given
    const rssAccept: RssAccept = await rssAcceptRepository.save(
      RssAcceptFixture.createRssAcceptFixture(),
    );

    // when - 비로그인
    const response = await agent.get(makeURL(rssAccept.id));

    // then
    expect(response.status).toBe(HttpStatus.OK);
    const { data }: { data: GetRssInfoResponseDto } = response.body;
    expect(data.isBlocked).toBe(false);
  });
});
