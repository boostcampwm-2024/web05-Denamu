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

const makeStatusURL = (rssId: number | string) => `/api/rss/${rssId}/subscriptions`;
const makeUserSubsURL = (userId: number | string) => `/api/users/${userId}/subscriptions`;

describe(`GET 구독 상태/목록 E2E Test`, () => {
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

  it('[200] 비로그인 시 isSubscribed=false 와 구독자 수를 반환한다.', async () => {
    const other = await userRepository.save(
      await UserFixture.createUserCryptFixture(),
    );
    await subscriptionRepository.insert({ user: other, rssAccept });

    const response = await agent.get(makeStatusURL(rssAccept.id));

    expect(response.status).toBe(HttpStatus.OK);
    expect(response.body.data.isSubscribed).toBe(false);
    expect(response.body.data.subscriberCount).toBe(1);
  });

  it('[200] 로그인 + 구독 상태면 isSubscribed=true 를 반환한다.', async () => {
    await subscriptionRepository.insert({ user, rssAccept });

    const response = await agent
      .get(makeStatusURL(rssAccept.id))
      .set('Authorization', `Bearer ${accessToken}`);

    expect(response.status).toBe(HttpStatus.OK);
    expect(response.body.data.isSubscribed).toBe(true);
    expect(response.body.data.subscriberCount).toBe(1);
  });

  it('[200] 특정 사용자의 구독 목록을 반환한다.', async () => {
    await subscriptionRepository.insert({ user, rssAccept });

    const response = await agent.get(makeUserSubsURL(user.id));

    expect(response.status).toBe(HttpStatus.OK);
    expect(response.body.data).toHaveLength(1);
    expect(response.body.data[0].id).toBe(rssAccept.id);
  });

  it('[200] 비로그인 상태에서도 타 사용자의 구독 목록을 조회할 수 있다.', async () => {
    const other = await userRepository.save(
      await UserFixture.createUserCryptFixture(),
    );
    await subscriptionRepository.insert({ user: other, rssAccept });

    const response = await agent.get(makeUserSubsURL(other.id));

    expect(response.status).toBe(HttpStatus.OK);
    expect(response.body.data).toHaveLength(1);
    expect(response.body.data[0].id).toBe(rssAccept.id);
  });
});
