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

const makeURL = (rssId: number | string) => `/api/rss/${rssId}/subscriptions`;

describe(`POST /api/rss/:rssId/subscriptions E2E Test`, () => {
  let agent: TestAgent;
  let userRepository: UserRepository;
  let rssAcceptRepository: RssAcceptRepository;
  let subscriptionRepository: SubscriptionRepository;
  let user: User;
  let rssAccept: RssAccept;
  let accessToken: string;

  beforeAll(() => {
    agent = supertest(testApp.getHttpServer());
    userRepository = testApp.get(UserRepository);
    rssAcceptRepository = testApp.get(RssAcceptRepository);
    subscriptionRepository = testApp.get(SubscriptionRepository);
  });

  beforeEach(async () => {
    user = await userRepository.save(await UserFixture.createUserCryptFixture());
    rssAccept = await rssAcceptRepository.save(
      RssAcceptFixture.createRssAcceptFixture(),
    );
    accessToken = createAccessToken(user);
  });

  it('[401] 로그인이 되어 있지 않으면 구독 등록에 실패한다.', async () => {
    const response = await agent.post(makeURL(rssAccept.id));

    expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
    const saved = await subscriptionRepository.findOneBy({
      user: { id: user.id },
      rssAccept: { id: rssAccept.id },
    });
    expect(saved).toBeNull();
  });

  it('[404] 존재하지 않는 RSS는 구독할 수 없다.', async () => {
    const response = await agent
      .post(makeURL(Number.MAX_SAFE_INTEGER))
      .set('Authorization', `Bearer ${accessToken}`);

    expect(response.status).toBe(HttpStatus.NOT_FOUND);
  });

  it('[403] 본인이 소유한 RSS는 구독할 수 없다.', async () => {
    const ownedRss = await rssAcceptRepository.save(
      RssAcceptFixture.createRssAcceptFixture({ userId: user.id }),
    );

    const response = await agent
      .post(makeURL(ownedRss.id))
      .set('Authorization', `Bearer ${accessToken}`);

    expect(response.status).toBe(HttpStatus.FORBIDDEN);
    const saved = await subscriptionRepository.findOneBy({
      user: { id: user.id },
      rssAccept: { id: ownedRss.id },
    });
    expect(saved).toBeNull();
  });

  it('[409] 이미 구독한 RSS는 다시 구독할 수 없다.', async () => {
    await subscriptionRepository.insert({ user, rssAccept });

    const response = await agent
      .post(makeURL(rssAccept.id))
      .set('Authorization', `Bearer ${accessToken}`);

    expect(response.status).toBe(HttpStatus.CONFLICT);
    const saved = await subscriptionRepository.findBy({
      user: { id: user.id },
      rssAccept: { id: rssAccept.id },
    });
    expect(saved.length).toBe(1);
  });

  it('[201] 로그인 상태에서 구독한 적 없는 RSS 구독을 성공한다.', async () => {
    const response = await agent
      .post(makeURL(rssAccept.id))
      .set('Authorization', `Bearer ${accessToken}`);

    expect(response.status).toBe(HttpStatus.CREATED);
    const saved = await subscriptionRepository.findOneBy({
      user: { id: user.id },
      rssAccept: { id: rssAccept.id },
    });
    expect(saved).not.toBeNull();
  });
});
