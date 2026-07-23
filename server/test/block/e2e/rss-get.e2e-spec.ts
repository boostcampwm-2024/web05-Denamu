import { HttpStatus } from '@nestjs/common';

import supertest from 'supertest';
import TestAgent from 'supertest/lib/agent';

import { RssBlockRepository } from '@block/repository/rssBlock.repository';

import { RssAcceptRepository } from '@rss/repository/rss.repository';

import { User } from '@user/entity/user.entity';
import { UserRepository } from '@user/repository/user.repository';

import { RssAcceptFixture } from '@test/config/common/fixture/rss-accept.fixture';
import { UserFixture } from '@test/config/common/fixture/user.fixture';
import { createAccessToken, testApp } from '@test/config/e2e/env/jest.setup';

const BASE_URL = '/api/blocks/rss';

describe(`GET ${BASE_URL} E2E Test`, () => {
  let agent: TestAgent;
  let rssBlockRepository: RssBlockRepository;
  let rssAcceptRepository: RssAcceptRepository;
  let userRepository: UserRepository;
  let blocker: User;
  let accessToken: string;

  beforeAll(() => {
    agent = supertest(testApp.getHttpServer());
    rssBlockRepository = testApp.get(RssBlockRepository);
    rssAcceptRepository = testApp.get(RssAcceptRepository);
    userRepository = testApp.get(UserRepository);
  });

  beforeEach(async () => {
    blocker = await userRepository.save(
      await UserFixture.createUserCryptFixture(),
    );
    accessToken = createAccessToken(blocker);
  });

  it('[401] 로그인이 되어 있지 않을 경우 RSS 차단 목록 조회를 실패한다.', async () => {
    // Http when
    const response = await agent.get(BASE_URL);

    // Http then
    const { data } = response.body;
    expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
    expect(data).toBeUndefined();
  });

  it('[200] 차단한 RSS가 없으면 빈 배열을 반환한다.', async () => {
    // Http when
    const response = await agent
      .get(BASE_URL)
      .set('Authorization', `Bearer ${accessToken}`);

    // Http then
    const { data } = response.body;
    expect(response.status).toBe(HttpStatus.OK);
    expect(data).toStrictEqual([]);
  });

  it('[200] 본인이 차단한 RSS 목록만 최신순으로 반환한다.', async () => {
    // given - 본인이 2개 차단, 다른 유저가 1개 차단
    const [targetRssA, targetRssB, otherTargetRss, otherBlocker] =
      await Promise.all([
        rssAcceptRepository.save(RssAcceptFixture.createRssAcceptFixture()),
        rssAcceptRepository.save(
          RssAcceptFixture.createRssAcceptFixture({ blogPlatform: 'velog' }),
        ),
        rssAcceptRepository.save(RssAcceptFixture.createRssAcceptFixture()),
        userRepository.save(UserFixture.createUserFixture()),
      ]);
    await rssBlockRepository.save({
      blocker: { id: blocker.id },
      blockedRss: { id: targetRssA.id },
    });
    await rssBlockRepository.save({
      blocker: { id: blocker.id },
      blockedRss: { id: targetRssB.id },
    });
    await rssBlockRepository.save({
      blocker: { id: otherBlocker.id },
      blockedRss: { id: otherTargetRss.id },
    });

    // Http when
    const response = await agent
      .get(BASE_URL)
      .set('Authorization', `Bearer ${accessToken}`);

    // Http then
    const { data } = response.body as {
      data: {
        rssId: number;
        name: string;
        blogPlatform: string;
        blockedAt: string;
      }[];
    };
    expect(response.status).toBe(HttpStatus.OK);
    expect(data).toHaveLength(2);
    expect(data.map((item) => item.rssId)).toStrictEqual([
      targetRssB.id,
      targetRssA.id,
    ]);
    expect(data[0]).toMatchObject({
      rssId: targetRssB.id,
      name: targetRssB.name,
      blogPlatform: targetRssB.blogPlatform,
    });
    expect(data[0].blockedAt).toBeDefined();
  });
});
