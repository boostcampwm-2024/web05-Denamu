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

describe(`PATCH /api/rss/certifications/:id E2E Test`, () => {
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

  it('[401] 로그인하지 않은 유저는 RSS 정보를 수정할 수 없다.', async () => {
    const response = await agent
      .patch(makeURL(rssAccept.id))
      .send({ name: '새 블로그명', userName: '새 신청자' });
    expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
  });

  it('[400] 블로그 이름이 비어 있으면 수정을 실패한다.', async () => {
    const response = await agent
      .patch(makeURL(rssAccept.id))
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ name: '', userName: '새 신청자' });
    expect(response.status).toBe(HttpStatus.BAD_REQUEST);
  });

  it('[404] 존재하지 않는 RSS면 수정을 실패한다.', async () => {
    const response = await agent
      .patch(makeURL(99999999))
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ name: '새 블로그명', userName: '새 신청자' });
    expect(response.status).toBe(HttpStatus.NOT_FOUND);
  });

  it('[403] 본인이 인증한 RSS가 아니면 수정을 실패한다.', async () => {
    // given - 다른 사용자가 인증한 RSS
    const other = await userRepository.save(
      await UserFixture.createUserCryptFixture(),
    );
    const othersRss = await rssAcceptRepository.save(
      RssAcceptFixture.createRssAcceptFixture({ userId: other.id }),
    );

    // Http when
    const response = await agent
      .patch(makeURL(othersRss.id))
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ name: '새 블로그명', userName: '새 신청자' });

    // Http then
    expect(response.status).toBe(HttpStatus.FORBIDDEN);
    const saved = await rssAcceptRepository.findOneBy({ id: othersRss.id });
    expect(saved.name).toBe(othersRss.name);
  });

  it('[409] 다른 RSS와 블로그 이름이 중복되면 수정을 실패한다.', async () => {
    // given - 이미 존재하는 이름
    const existing = await rssAcceptRepository.save(
      RssAcceptFixture.createRssAcceptFixture(),
    );

    // Http when
    const response = await agent
      .patch(makeURL(rssAccept.id))
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ name: existing.name, userName: '새 신청자' });

    // Http then
    expect(response.status).toBe(HttpStatus.CONFLICT);
  });

  it('[200] 본인이 인증한 RSS면 블로그 이름과 신청자 이름을 수정하고 RSS URL은 유지한다.', async () => {
    // given
    const newName = `수정된 블로그 ${Date.now()}`;
    const newUserName = '수정된 신청자';

    // Http when
    const response = await agent
      .patch(makeURL(rssAccept.id))
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ name: newName, userName: newUserName });

    // Http then
    expect(response.status).toBe(HttpStatus.OK);
    const saved = await rssAcceptRepository.findOneBy({ id: rssAccept.id });
    expect(saved.name).toBe(newName);
    expect(saved.userName).toBe(newUserName);
    expect(saved.rssUrl).toBe(rssAccept.rssUrl);
    expect(saved.userId).toBe(user.id);
  });
});
