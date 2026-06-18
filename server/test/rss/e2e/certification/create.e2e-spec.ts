import { HttpStatus } from '@nestjs/common';

import * as uuid from 'uuid';
import supertest from 'supertest';
import TestAgent from 'supertest/lib/agent';

import { REDIS_KEYS } from '@common/redis/redis.constant';
import { RedisService } from '@common/redis/redis.service';

import { CreateRssCertificationResponseDto } from '@rss/dto/response/createRssCertification.dto';
import { RssAccept } from '@rss/entity/rss.entity';
import { RssAcceptRepository } from '@rss/repository/rss.repository';

import { User } from '@user/entity/user.entity';
import { UserRepository } from '@user/repository/user.repository';

import { RssAcceptFixture } from '@test/config/common/fixture/rss-accept.fixture';
import { UserFixture } from '@test/config/common/fixture/user.fixture';
import { createAccessToken, testApp } from '@test/config/e2e/env/jest.setup';

const URL = '/api/rss/certifications';

describe(`POST ${URL} E2E Test`, () => {
  let agent: TestAgent;
  let rssAcceptRepository: RssAcceptRepository;
  let userRepository: UserRepository;
  let redisService: RedisService;
  let user: User;
  let accessToken: string;
  const certificationCode = 'rss-certification-code';
  const redisKeyMake = (code: string) =>
    `${REDIS_KEYS.RSS_CERTIFICATION_KEY}:${code}`;

  beforeAll(() => {
    agent = supertest(testApp.getHttpServer());
    rssAcceptRepository = testApp.get(RssAcceptRepository);
    userRepository = testApp.get(UserRepository);
    redisService = testApp.get(RedisService);
  });

  beforeEach(async () => {
    user = await userRepository.save(await UserFixture.createUserCryptFixture());
    accessToken = createAccessToken(user);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('[401] 로그인하지 않은 유저는 RSS 소유 인증을 요청할 수 없다.', async () => {
    const response = await agent.post(URL).send({ blogName: 'any' });
    expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
  });

  it('[404] 일치하는 블로그 이름의 RSS가 없으면 인증을 실패한다.', async () => {
    const response = await agent
      .post(URL)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ blogName: '존재하지않는블로그' });
    expect(response.status).toBe(HttpStatus.NOT_FOUND);
  });

  it('[200] RSS 이메일과 사용자 이메일이 같으면 즉시 인증되고 메일을 보내지 않는다.', async () => {
    // given
    jest.spyOn(uuid, 'v4').mockReturnValue(certificationCode as any);
    const rssAccept = await rssAcceptRepository.save(
      RssAcceptFixture.createRssAcceptFixture({ email: user.email }),
    );

    // Http when
    const response = await agent
      .post(URL)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ blogName: rssAccept.name });

    // Http then
    expect(response.status).toBe(HttpStatus.OK);
    const { data }: { data: CreateRssCertificationResponseDto } = response.body;
    expect(data.certified).toBe(true);

    // DB, Redis then
    const [savedRssAccept, savedCode] = await Promise.all([
      rssAcceptRepository.findOneBy({ id: rssAccept.id }),
      redisService.get(redisKeyMake(certificationCode)),
    ]);
    expect(savedRssAccept.userId).toBe(user.id);
    expect(savedCode).toBeNull();
  });

  it('[200] RSS 이메일과 사용자 이메일이 다르면 인증 코드를 저장하고 즉시 연결하지 않는다.', async () => {
    // given
    jest.spyOn(uuid, 'v4').mockReturnValue(certificationCode as any);
    const rssAccept = await rssAcceptRepository.save(
      RssAcceptFixture.createRssAcceptFixture({ email: 'other@test.com' }),
    );

    // Http when
    const response = await agent
      .post(URL)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ blogName: rssAccept.name });

    // Http then
    expect(response.status).toBe(HttpStatus.OK);
    const { data }: { data: CreateRssCertificationResponseDto } = response.body;
    expect(data.certified).toBe(false);

    // DB, Redis then
    const [savedRssAccept, savedCode] = await Promise.all([
      rssAcceptRepository.findOneBy({ id: rssAccept.id }),
      redisService.get(redisKeyMake(certificationCode)),
    ]);
    expect(savedRssAccept.userId).toBeNull();
    expect(savedCode).not.toBeNull();
  });

  it('[409] 다른 사용자가 이미 인증한 RSS면 인증을 실패한다.', async () => {
    // given
    const other = await userRepository.save(
      await UserFixture.createUserCryptFixture(),
    );
    const rssAccept: RssAccept = await rssAcceptRepository.save(
      RssAcceptFixture.createRssAcceptFixture({ userId: other.id }),
    );

    // Http when
    const response = await agent
      .post(URL)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ blogName: rssAccept.name });

    // Http then
    expect(response.status).toBe(HttpStatus.CONFLICT);
  });
});
