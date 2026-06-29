import { HttpStatus } from '@nestjs/common';

import supertest from 'supertest';
import TestAgent from 'supertest/lib/agent';

import { REDIS_KEYS } from '@common/redis/redis.constant';
import { RedisService } from '@common/redis/redis.service';

import { RssAccept } from '@rss/entity/rss.entity';
import { RssAcceptRepository } from '@rss/repository/rss.repository';

import { User } from '@user/entity/user.entity';
import { UserRepository } from '@user/repository/user.repository';

import { RssAcceptFixture } from '@test/config/common/fixture/rss-accept.fixture';
import { UserFixture } from '@test/config/common/fixture/user.fixture';
import { createAccessToken, testApp } from '@test/config/e2e/env/jest.setup';

const URL = '/api/rss/certifications/verify';

describe(`POST ${URL} E2E Test`, () => {
  let agent: TestAgent;
  let rssAcceptRepository: RssAcceptRepository;
  let userRepository: UserRepository;
  let redisService: RedisService;
  let user: User;
  let rssAccept: RssAccept;
  let accessToken: string;
  const code = 'rss-certification-verify-code';
  const redisKeyMake = (code: string) =>
    `${REDIS_KEYS.RSS_CERTIFICATION_KEY}:${code}`;

  beforeAll(() => {
    agent = supertest(testApp.getHttpServer());
    rssAcceptRepository = testApp.get(RssAcceptRepository);
    userRepository = testApp.get(UserRepository);
    redisService = testApp.get(RedisService);
  });

  beforeEach(async () => {
    user = await userRepository.save(
      await UserFixture.createUserCryptFixture(),
    );
    rssAccept = await rssAcceptRepository.save(
      RssAcceptFixture.createRssAcceptFixture(),
    );
    accessToken = createAccessToken(user);
  });

  it('[404] 인증 코드가 만료되었거나 없으면 검증을 실패한다.', async () => {
    const response = await agent
      .post(URL)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ code: 'wrong-code' });
    expect(response.status).toBe(HttpStatus.NOT_FOUND);
  });

  it('[403] 본인의 인증 요청이 아니면 검증을 실패한다.', async () => {
    // given - 다른 유저의 인증 요청
    await redisService.set(
      redisKeyMake(code),
      JSON.stringify({ rssAcceptId: rssAccept.id, userId: user.id + 999 }),
    );

    // Http when
    const response = await agent
      .post(URL)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ code });

    // Http then
    expect(response.status).toBe(HttpStatus.FORBIDDEN);
    const savedRssAccept = await rssAcceptRepository.findOneBy({
      id: rssAccept.id,
    });
    expect(savedRssAccept.userId).toBeNull();
  });

  it('[200] 본인의 인증 코드면 RSS를 연결하고 인증 코드를 정리한다.', async () => {
    // given
    await redisService.set(
      redisKeyMake(code),
      JSON.stringify({ rssAcceptId: rssAccept.id, userId: user.id }),
    );

    // Http when
    const response = await agent
      .post(URL)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ code });

    // Http then
    expect(response.status).toBe(HttpStatus.OK);
    const [savedRssAccept, savedCode] = await Promise.all([
      rssAcceptRepository.findOneBy({ id: rssAccept.id }),
      redisService.get(redisKeyMake(code)),
    ]);
    expect(savedRssAccept.userId).toBe(user.id);
    expect(savedCode).toBeNull();
  });
});
