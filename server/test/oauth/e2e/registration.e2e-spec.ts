import { HttpStatus } from '@nestjs/common';

import supertest from 'supertest';
import TestAgent from 'supertest/lib/agent';

import { REDIS_KEYS } from '@common/redis/redis.constant';
import { RedisService } from '@common/redis/redis.service';

import { RssAcceptRepository } from '@rss/repository/rss.repository';

import {
  OAUTH_PENDING_TTL,
  OAuthType,
} from '@user/constant/oauth.constant';
import { ProviderRepository } from '@user/repository/provider.repository';
import { UserRepository } from '@user/repository/user.repository';

import { RssAcceptFixture } from '@test/config/common/fixture/rss-accept.fixture';
import { UserFixture } from '@test/config/common/fixture/user.fixture';
import { testApp } from '@test/config/e2e/env/jest.setup';

const URL = '/api/oauth/registrations';

describe(`POST ${URL} E2E Test`, () => {
  let agent: TestAgent;
  let redisService: RedisService;
  let userRepository: UserRepository;
  let providerRepository: ProviderRepository;
  let rssAcceptRepository: RssAcceptRepository;

  const pendingToken = 'oauth-pending-token';

  const stagePending = async (email = 'oauth-new@test.com') => {
    await redisService.set(
      `${REDIS_KEYS.OAUTH_PENDING_KEY}:${pendingToken}`,
      JSON.stringify({
        providerType: OAuthType.Google,
        providerUserId: 'provider-uid-1',
        email,
        profileImage: null,
        providerRefreshToken: 'provider-refresh-token',
      }),
      'EX',
      OAUTH_PENDING_TTL,
    );
  };

  beforeAll(() => {
    agent = supertest(testApp.getHttpServer());
    redisService = testApp.get(RedisService);
    userRepository = testApp.get(UserRepository);
    providerRepository = testApp.get(ProviderRepository);
    rssAcceptRepository = testApp.get(RssAcceptRepository);
  });

  it('[201] 닉네임 입력 시 사용자/Provider를 생성하고 refresh 쿠키를 설정한다.', async () => {
    // given
    await stagePending();

    // Http when
    const response = await agent
      .post(URL)
      .set('Cookie', `oauth_pending_token=${pendingToken}`)
      .send({ userName: 'new-oauth-nickname' });

    // Http then
    const setCookies = ([] as string[]).concat(
      response.headers['set-cookie'] ?? [],
    );
    expect(response.status).toBe(HttpStatus.CREATED);
    expect(
      setCookies.some((cookie) => cookie.startsWith('refresh_token=')),
    ).toBe(true);

    // DB then
    const savedUser = await userRepository.findOne({
      where: { userName: 'new-oauth-nickname' },
    });
    expect(savedUser).not.toBeNull();

    const savedProvider = await providerRepository.findOneBy({
      providerUserId: 'provider-uid-1',
      providerType: OAuthType.Google,
    });
    expect(savedProvider).not.toBeNull();

    // Redis then - pending 키 삭제
    const pending = await redisService.get(
      `${REDIS_KEYS.OAUTH_PENDING_KEY}:${pendingToken}`,
    );
    expect(pending).toBeNull();
  });

  it('[409] 닉네임이 중복될 경우 회원가입을 실패한다.', async () => {
    // given
    const existing = await userRepository.save(UserFixture.createUserFixture());
    await stagePending();

    // Http when
    const response = await agent
      .post(URL)
      .set('Cookie', `oauth_pending_token=${pendingToken}`)
      .send({ userName: existing.userName });

    // Http then
    expect(response.status).toBe(HttpStatus.CONFLICT);
  });

  it('[201] OAuth 가입 시 동일 이메일의 미연결 RSS에 user_id를 연결한다.', async () => {
    // given
    const email = 'oauth-blogger@test.com';
    const rssAccept = await rssAcceptRepository.save(
      RssAcceptFixture.createRssAcceptFixture({ email }),
    );
    await stagePending(email);

    // Http when
    const response = await agent
      .post(URL)
      .set('Cookie', `oauth_pending_token=${pendingToken}`)
      .send({ userName: 'oauth-blogger-nickname' });

    // Http then
    expect(response.status).toBe(HttpStatus.CREATED);

    // DB then
    const [savedUser, savedRssAccept] = await Promise.all([
      userRepository.findOne({ where: { email } }),
      rssAcceptRepository.findOneBy({ id: rssAccept.id }),
    ]);
    expect(savedRssAccept.userId).toBe(savedUser.id);
  });

  it('[404] pending 쿠키가 없을 경우 회원가입을 실패한다.', async () => {
    // Http when
    const response = await agent.post(URL).send({ userName: 'whatever' });

    // Http then
    expect(response.status).toBe(HttpStatus.NOT_FOUND);
  });
});
