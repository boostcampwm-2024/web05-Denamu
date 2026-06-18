import { HttpStatus } from '@nestjs/common';

import supertest from 'supertest';
import TestAgent from 'supertest/lib/agent';

import { RssAccept } from '@rss/entity/rss.entity';
import { RssAcceptRepository } from '@rss/repository/rss.repository';

import { User } from '@user/entity/user.entity';
import { UserRepository } from '@user/repository/user.repository';

import { RssAcceptFixture } from '@test/config/common/fixture/rss-accept.fixture';
import { UserFixture } from '@test/config/common/fixture/user.fixture';
import { createAccessToken, testApp } from '@test/config/e2e/env/jest.setup';

const makeURL = (id: number | string) => `/api/rss/certifications/${id}`;

describe(`DELETE /api/rss/certifications/:id E2E Test`, () => {
  let agent: TestAgent;
  let rssAcceptRepository: RssAcceptRepository;
  let userRepository: UserRepository;
  let user: User;
  let rssAccept: RssAccept;
  let accessToken: string;

  beforeAll(() => {
    agent = supertest(testApp.getHttpServer());
    rssAcceptRepository = testApp.get(RssAcceptRepository);
    userRepository = testApp.get(UserRepository);
  });

  beforeEach(async () => {
    user = await userRepository.save(await UserFixture.createUserCryptFixture());
    rssAccept = await rssAcceptRepository.save(
      RssAcceptFixture.createRssAcceptFixture({ userId: user.id }),
    );
    accessToken = createAccessToken(user);
  });

  it('[401] 로그인하지 않은 유저는 인증을 해제할 수 없다.', async () => {
    const response = await agent.delete(makeURL(rssAccept.id));
    expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
  });

  it('[403] 본인이 인증한 RSS가 아니면 해제를 실패한다.', async () => {
    // given - 다른 사용자가 인증한 RSS
    const other = await userRepository.save(
      await UserFixture.createUserCryptFixture(),
    );
    const othersRss = await rssAcceptRepository.save(
      RssAcceptFixture.createRssAcceptFixture({ userId: other.id }),
    );

    // Http when
    const response = await agent
      .delete(makeURL(othersRss.id))
      .set('Authorization', `Bearer ${accessToken}`);

    // Http then
    expect(response.status).toBe(HttpStatus.FORBIDDEN);
    const saved = await rssAcceptRepository.findOneBy({ id: othersRss.id });
    expect(saved.userId).toBe(other.id);
  });

  it('[200] 본인이 인증한 RSS면 연결을 해제(user_id NULL)한다.', async () => {
    // Http when
    const response = await agent
      .delete(makeURL(rssAccept.id))
      .set('Authorization', `Bearer ${accessToken}`);

    // Http then
    expect(response.status).toBe(HttpStatus.OK);
    const saved = await rssAcceptRepository.findOneBy({ id: rssAccept.id });
    expect(saved.userId).toBeNull();
  });
});
