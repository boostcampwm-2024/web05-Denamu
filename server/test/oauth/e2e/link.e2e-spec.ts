import { HttpStatus } from '@nestjs/common';

import supertest from 'supertest';
import TestAgent from 'supertest/lib/agent';

import { OAuthType } from '@user/constant/oauth.constant';
import { GetLinkedProvidersResponseDto } from '@user/dto/response/getLinkedProviders.dto';
import { Provider } from '@user/entity/provider.entity';
import { User } from '@user/entity/user.entity';
import { ProviderRepository } from '@user/repository/provider.repository';
import { UserRepository } from '@user/repository/user.repository';

import { UserFixture } from '@test/config/common/fixture/user.fixture';
import { createAccessToken, testApp } from '@test/config/e2e/env/jest.setup';

const URL = '/api/oauth/links';

describe(`OAuth Link E2E Test`, () => {
  let agent: TestAgent;
  let userRepository: UserRepository;
  let providerRepository: ProviderRepository;

  beforeAll(() => {
    agent = supertest(testApp.getHttpServer());
    userRepository = testApp.get(UserRepository);
    providerRepository = testApp.get(ProviderRepository);
  });

  const saveUser = (overwrites = {}) =>
    userRepository.save(UserFixture.createUserFixture(overwrites));

  const saveProvider = (user: User, providerType: OAuthType, suffix = '') =>
    providerRepository.save({
      providerType,
      providerUserId: `provider-uid-${providerType}${suffix}`,
      providerUserName: `handle-${providerType}`,
      refreshToken: 'provider-refresh-token',
      user,
    } as Provider);

  describe(`POST ${URL} (연결 시작)`, () => {
    it('[401] 인증되지 않은 요청은 실패한다.', async () => {
      // Http when
      const response = await agent.post(URL).send({ provider: OAuthType.Google });

      // Http then
      expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
    });

    it('[400] 지원하지 않는 제공자는 실패한다.', async () => {
      // given
      const user = await saveUser();
      const accessToken = createAccessToken(user);

      // Http when
      const response = await agent
        .post(URL)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ provider: 'naver' });

      // Http then
      expect(response.status).toBe(HttpStatus.BAD_REQUEST);
    });

    it('[201] 인증된 유저는 연결용 authUrl과 CSRF 쿠키를 발급받는다.', async () => {
      // given
      const user = await saveUser();
      const accessToken = createAccessToken(user);

      // Http when
      const response = await agent
        .post(URL)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ provider: OAuthType.Google });

      // Http then
      const setCookies = ([] as string[]).concat(
        response.headers['set-cookie'] ?? [],
      );
      const { data }: { data: { authUrl: string } } = response.body;
      expect(response.status).toBe(HttpStatus.CREATED);
      expect(typeof data.authUrl).toBe('string');
      expect(data.authUrl).toContain('accounts.google.com');
      expect(
        setCookies.some((cookie) => cookie.startsWith('oauth_csrf_token=')),
      ).toBe(true);
    });
  });

  describe(`GET ${URL} (목록 조회)`, () => {
    it('[401] 인증되지 않은 요청은 실패한다.', async () => {
      // Http when
      const response = await agent.get(URL);

      // Http then
      expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
    });

    it('[200] 비밀번호 보유 여부와 연결된 제공자 목록을 반환한다.', async () => {
      // given
      const user = await saveUser({ password: 'hashed-password' });
      await saveProvider(user, OAuthType.Google);
      const accessToken = createAccessToken(user);

      // Http when
      const response = await agent
        .get(URL)
        .set('Authorization', `Bearer ${accessToken}`);

      // Http then
      const { data }: { data: GetLinkedProvidersResponseDto } = response.body;
      expect(response.status).toBe(HttpStatus.OK);
      expect(data.hasPassword).toBe(true);
      expect(data.providers).toHaveLength(1);
      expect(data.providers[0]).toEqual(
        expect.objectContaining({
          provider: OAuthType.Google,
          providerUserName: `handle-${OAuthType.Google}`,
        }),
      );
    });
  });

  describe(`DELETE ${URL}/:provider (연결 해제)`, () => {
    it('[401] 인증되지 않은 요청은 실패한다.', async () => {
      // Http when
      const response = await agent.delete(`${URL}/${OAuthType.Google}`);

      // Http then
      expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
    });

    it('[404] 연결되지 않은 제공자를 해제하면 실패한다.', async () => {
      // given
      const user = await saveUser({ password: 'hashed-password' });
      await saveProvider(user, OAuthType.Github);
      const accessToken = createAccessToken(user);

      // Http when
      const response = await agent
        .delete(`${URL}/${OAuthType.Google}`)
        .set('Authorization', `Bearer ${accessToken}`);

      // Http then
      expect(response.status).toBe(HttpStatus.NOT_FOUND);
    });

    it('[400] 비밀번호가 없고 마지막 OAuth면 해제할 수 없다.', async () => {
      // given
      const user = await saveUser({ password: null });
      const provider = await saveProvider(user, OAuthType.Google);
      const accessToken = createAccessToken(user);

      // Http when
      const response = await agent
        .delete(`${URL}/${OAuthType.Google}`)
        .set('Authorization', `Bearer ${accessToken}`);

      // Http then
      expect(response.status).toBe(HttpStatus.BAD_REQUEST);

      // DB then: 연결이 유지되어야 한다.
      const stillLinked = await providerRepository.findOneBy({ id: provider.id });
      expect(stillLinked).not.toBeNull();
    });

    it('[200] 비밀번호가 있으면 마지막 OAuth도 해제한다.', async () => {
      // given
      const user = await saveUser({ password: 'hashed-password' });
      const provider = await saveProvider(user, OAuthType.Google);
      const accessToken = createAccessToken(user);

      // Http when
      const response = await agent
        .delete(`${URL}/${OAuthType.Google}`)
        .set('Authorization', `Bearer ${accessToken}`);

      // Http then
      expect(response.status).toBe(HttpStatus.OK);

      // DB then: 연결이 삭제되어야 한다.
      const deleted = await providerRepository.findOneBy({ id: provider.id });
      expect(deleted).toBeNull();
    });
  });
});
