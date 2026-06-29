import { HttpStatus } from '@nestjs/common';

import supertest from 'supertest';
import TestAgent from 'supertest/lib/agent';

import { RssAccept } from '@rss/entity/rss.entity';
import { RssAcceptRepository } from '@rss/repository/rss.repository';

import { SubscriptionRepository } from '@subscribe/repository/subscription.repository';

import { User } from '@user/entity/user.entity';
import { UserRepository } from '@user/repository/user.repository';

import { RssAcceptFixture } from '@test/config/common/fixture/rss-accept.fixture';
import { UserFixture } from '@test/config/common/fixture/user.fixture';
import { createAccessToken, testApp } from '@test/config/e2e/env/jest.setup';

const makeURL = (rssId: number | string) => `/api/rss/${rssId}/subscribers`;

describe(`GET /api/rss/:rssId/subscribers E2E Test`, () => {
  let agent: TestAgent;
  let userRepository: UserRepository;
  let rssAcceptRepository: RssAcceptRepository;
  let subscriptionRepository: SubscriptionRepository;
  let owner: User;
  let ownedRss: RssAccept;
  let accessToken: string;

  beforeAll(() => {
    agent = supertest(testApp.getHttpServer());
    userRepository = testApp.get(UserRepository);
    rssAcceptRepository = testApp.get(RssAcceptRepository);
    subscriptionRepository = testApp.get(SubscriptionRepository);
  });

  beforeEach(async () => {
    owner = await userRepository.save(await UserFixture.createUserCryptFixture());
    ownedRss = await rssAcceptRepository.save(
      RssAcceptFixture.createRssAcceptFixture({ userId: owner.id }),
    );
    accessToken = createAccessToken(owner);
  });

  const addSubscriber = async () => {
    const subscriber = await userRepository.save(
      await UserFixture.createUserCryptFixture(),
    );
    return subscriptionRepository.save({
      user: subscriber,
      rssAccept: ownedRss,
    });
  };

  it('[401] 로그인이 되어 있지 않으면 구독자 목록을 조회할 수 없다.', async () => {
    const response = await agent.get(makeURL(ownedRss.id));

    expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
  });

  it('[404] 존재하지 않는 RSS의 구독자는 조회할 수 없다.', async () => {
    const response = await agent
      .get(makeURL(Number.MAX_SAFE_INTEGER))
      .set('Authorization', `Bearer ${accessToken}`);

    expect(response.status).toBe(HttpStatus.NOT_FOUND);
  });

  it('[403] 본인 소유가 아닌 RSS의 구독자는 조회할 수 없다.', async () => {
    const otherRss = await rssAcceptRepository.save(
      RssAcceptFixture.createRssAcceptFixture(),
    );

    const response = await agent
      .get(makeURL(otherRss.id))
      .set('Authorization', `Bearer ${accessToken}`);

    expect(response.status).toBe(HttpStatus.FORBIDDEN);
  });

  it('[200] 본인 소유 RSS의 구독자 목록을 반환한다.', async () => {
    const subscription = await addSubscriber();

    const response = await agent
      .get(makeURL(ownedRss.id))
      .set('Authorization', `Bearer ${accessToken}`);

    expect(response.status).toBe(HttpStatus.OK);
    expect(response.body.data.result).toHaveLength(1);
    expect(response.body.data.result[0].id).toBe(subscription.id);
    expect(response.body.data.hasMore).toBe(false);
  });

  it('[200] limit 기반 커서 페이지네이션이 동작한다.', async () => {
    const first = await addSubscriber();
    const second = await addSubscriber();
    const third = await addSubscriber();

    // 1페이지: 최신순(id DESC)으로 limit=2개 + hasMore=true
    const page1 = await agent
      .get(makeURL(ownedRss.id))
      .query({ limit: 2 })
      .set('Authorization', `Bearer ${accessToken}`);

    expect(page1.status).toBe(HttpStatus.OK);
    expect(page1.body.data.result.map((r: { id: number }) => r.id)).toEqual([
      third.id,
      second.id,
    ]);
    expect(page1.body.data.hasMore).toBe(true);
    expect(page1.body.data.lastId).toBe(second.id);

    // 2페이지: 커서(lastId) 이후 남은 1개 + hasMore=false
    const page2 = await agent
      .get(makeURL(ownedRss.id))
      .query({ limit: 2, lastId: page1.body.data.lastId })
      .set('Authorization', `Bearer ${accessToken}`);

    expect(page2.status).toBe(HttpStatus.OK);
    expect(page2.body.data.result.map((r: { id: number }) => r.id)).toEqual([
      first.id,
    ]);
    expect(page2.body.data.hasMore).toBe(false);
  });
});
