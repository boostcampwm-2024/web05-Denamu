import { HttpStatus } from '@nestjs/common';

import supertest from 'supertest';
import TestAgent from 'supertest/lib/agent';

import { PreviewRssCertificationResponseDto } from '@rss/dto/response/previewRssCertification.dto';
import { RssAccept } from '@rss/entity/rss.entity';
import { RssAcceptRepository } from '@rss/repository/rss.repository';

import { User } from '@user/entity/user.entity';
import { UserRepository } from '@user/repository/user.repository';

import { RssAcceptFixture } from '@test/config/common/fixture/rss-accept.fixture';
import { UserFixture } from '@test/config/common/fixture/user.fixture';
import { createAccessToken, testApp } from '@test/config/e2e/env/jest.setup';

const URL = '/api/rss/certifications/preview';

describe(`GET ${URL} E2E Test`, () => {
  let agent: TestAgent;
  let rssAcceptRepository: RssAcceptRepository;
  let userRepository: UserRepository;
  let user: User;
  let accessToken: string;

  beforeAll(() => {
    agent = supertest(testApp.getHttpServer());
    rssAcceptRepository = testApp.get(RssAcceptRepository);
    userRepository = testApp.get(UserRepository);
  });

  beforeEach(async () => {
    user = await userRepository.save(await UserFixture.createUserCryptFixture());
    accessToken = createAccessToken(user);
  });

  it('[401] 로그인하지 않은 유저는 미리보기를 조회할 수 없다.', async () => {
    const response = await agent.get(URL).query({ blogName: 'any' });
    expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
  });

  it('[404] 일치하는 블로그 이름의 RSS가 없으면 미리보기를 실패한다.', async () => {
    const response = await agent
      .get(URL)
      .set('Authorization', `Bearer ${accessToken}`)
      .query({ blogName: '존재하지않는블로그' });
    expect(response.status).toBe(HttpStatus.NOT_FOUND);
  });

  it('[200] RSS 이메일과 사용자 이메일이 같으면 2차 인증이 필요 없다고 반환한다.', async () => {
    // given
    const rssAccept = await rssAcceptRepository.save(
      RssAcceptFixture.createRssAcceptFixture({ email: user.email }),
    );

    // Http when
    const response = await agent
      .get(URL)
      .set('Authorization', `Bearer ${accessToken}`)
      .query({ blogName: rssAccept.name });

    // Http then
    expect(response.status).toBe(HttpStatus.OK);
    const { data }: { data: PreviewRssCertificationResponseDto } = response.body;
    expect(data.name).toBe(rssAccept.name);
    expect(data.userName).toBe(rssAccept.userName);
    expect(data.rssUrl).toBe(rssAccept.rssUrl);
    expect(data.blogPlatform).toBe(rssAccept.blogPlatform);
    expect(data.requiresEmailVerification).toBe(false);
  });

  it('[200] RSS 이메일과 사용자 이메일이 다르면 2차 인증이 필요하다고 반환한다.', async () => {
    // given
    const rssAccept = await rssAcceptRepository.save(
      RssAcceptFixture.createRssAcceptFixture({ email: 'other@test.com' }),
    );

    // Http when
    const response = await agent
      .get(URL)
      .set('Authorization', `Bearer ${accessToken}`)
      .query({ blogName: rssAccept.name });

    // Http then
    expect(response.status).toBe(HttpStatus.OK);
    const { data }: { data: PreviewRssCertificationResponseDto } = response.body;
    expect(data.requiresEmailVerification).toBe(true);
  });

  it('[200] 미리보기는 조회만 수행하고 소유 연결을 만들지 않는다.', async () => {
    // given
    const rssAccept = await rssAcceptRepository.save(
      RssAcceptFixture.createRssAcceptFixture({ email: user.email }),
    );

    // Http when
    await agent
      .get(URL)
      .set('Authorization', `Bearer ${accessToken}`)
      .query({ blogName: rssAccept.name });

    // DB then - 부작용 없음
    const saved = await rssAcceptRepository.findOneBy({ id: rssAccept.id });
    expect(saved.userId).toBeNull();
  });

  it('[409] 본인이 이미 인증한 RSS면 미리보기를 실패한다.', async () => {
    // given
    const rssAccept = await rssAcceptRepository.save(
      RssAcceptFixture.createRssAcceptFixture({ userId: user.id }),
    );

    // Http when
    const response = await agent
      .get(URL)
      .set('Authorization', `Bearer ${accessToken}`)
      .query({ blogName: rssAccept.name });

    // Http then
    expect(response.status).toBe(HttpStatus.CONFLICT);
  });

  it('[409] 다른 사용자가 이미 인증한 RSS면 미리보기를 실패한다.', async () => {
    // given
    const other = await userRepository.save(
      await UserFixture.createUserCryptFixture(),
    );
    const rssAccept: RssAccept = await rssAcceptRepository.save(
      RssAcceptFixture.createRssAcceptFixture({ userId: other.id }),
    );

    // Http when
    const response = await agent
      .get(URL)
      .set('Authorization', `Bearer ${accessToken}`)
      .query({ blogName: rssAccept.name });

    // Http then
    expect(response.status).toBe(HttpStatus.CONFLICT);
  });
});
