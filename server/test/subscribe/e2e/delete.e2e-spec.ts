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

describe(`DELETE /api/rss/:rssId/subscriptions E2E Test`, () => {
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

  it('[404] 구독하지 않은 RSS는 해제할 수 없다.', async () => {
    const response = await agent
      .delete(makeURL(rssAccept.id))
      .set('Authorization', `Bearer ${accessToken}`);

    expect(response.status).toBe(HttpStatus.NOT_FOUND);
  });

  it('[200] 구독 중인 RSS 해제를 성공한다.', async () => {
    await subscriptionRepository.insert({ user, rssAccept });

    const response = await agent
      .delete(makeURL(rssAccept.id))
      .set('Authorization', `Bearer ${accessToken}`);

    expect(response.status).toBe(HttpStatus.OK);
    const saved = await subscriptionRepository.findOneBy({
      user: { id: user.id },
      rssAccept: { id: rssAccept.id },
    });
    expect(saved).toBeNull();
  });
});
