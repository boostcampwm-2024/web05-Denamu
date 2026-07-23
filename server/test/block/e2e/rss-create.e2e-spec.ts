import { HttpStatus } from '@nestjs/common';

import supertest from 'supertest';
import TestAgent from 'supertest/lib/agent';

import { RssBlockRepository } from '@block/repository/rssBlock.repository';

import { RssAccept } from '@rss/entity/rss.entity';
import { RssAcceptRepository } from '@rss/repository/rss.repository';

import { User } from '@user/entity/user.entity';
import { UserRepository } from '@user/repository/user.repository';

import { RssAcceptFixture } from '@test/config/common/fixture/rss-accept.fixture';
import { UserFixture } from '@test/config/common/fixture/user.fixture';
import { createAccessToken, testApp } from '@test/config/e2e/env/jest.setup';

const BASE_URL = '/api/blocks/rss';

describe(`POST ${BASE_URL}/:rssId E2E Test`, () => {
  let agent: TestAgent;
  let rssBlockRepository: RssBlockRepository;
  let rssAcceptRepository: RssAcceptRepository;
  let userRepository: UserRepository;
  let blocker: User;
  let targetRss: RssAccept;
  let accessToken: string;

  beforeAll(() => {
    agent = supertest(testApp.getHttpServer());
    rssBlockRepository = testApp.get(RssBlockRepository);
    rssAcceptRepository = testApp.get(RssAcceptRepository);
    userRepository = testApp.get(UserRepository);
  });

  beforeEach(async () => {
    [blocker, targetRss] = await Promise.all([
      userRepository.save(await UserFixture.createUserCryptFixture()),
      rssAcceptRepository.save(RssAcceptFixture.createRssAcceptFixture()),
    ]);
    accessToken = createAccessToken(blocker);
  });

  it('[401] 로그인이 되어 있지 않을 경우 RSS 차단 등록을 실패한다.', async () => {
    // Http when
    const response = await agent.post(`${BASE_URL}/${targetRss.id}`);

    // Http then
    const { data } = response.body;
    expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
    expect(data).toBeUndefined();

    // DB when
    const savedRssBlock = await rssBlockRepository.findOneBy({
      blocker: { id: blocker.id },
      blockedRss: { id: targetRss.id },
    });

    // DB then
    expect(savedRssBlock).toBeNull();
  });

  it('[404] 차단 대상 RSS가 존재하지 않을 경우 RSS 차단 등록을 실패한다.', async () => {
    // Http when
    const response = await agent
      .post(`${BASE_URL}/${Number.MAX_SAFE_INTEGER}`)
      .set('Authorization', `Bearer ${accessToken}`);

    // Http then
    const { data } = response.body;
    expect(response.status).toBe(HttpStatus.NOT_FOUND);
    expect(data).toBeUndefined();
  });

  it('[409] 이미 차단한 RSS를 다시 차단할 경우 실패한다.', async () => {
    // given
    await rssBlockRepository.save({
      blocker: { id: blocker.id },
      blockedRss: { id: targetRss.id },
    });

    // Http when
    const response = await agent
      .post(`${BASE_URL}/${targetRss.id}`)
      .set('Authorization', `Bearer ${accessToken}`);

    // Http then
    const { data } = response.body;
    expect(response.status).toBe(HttpStatus.CONFLICT);
    expect(data).toBeUndefined();
  });

  it('[201] RSS 차단 등록을 성공한다.', async () => {
    // Http when
    const response = await agent
      .post(`${BASE_URL}/${targetRss.id}`)
      .set('Authorization', `Bearer ${accessToken}`);

    // Http then
    expect(response.status).toBe(HttpStatus.CREATED);

    // DB when
    const savedRssBlock = await rssBlockRepository.findOneBy({
      blocker: { id: blocker.id },
      blockedRss: { id: targetRss.id },
    });

    // DB then
    expect(savedRssBlock).not.toBeNull();
  });
});
