import { HttpStatus } from '@nestjs/common';

import axios from 'axios';
import supertest from 'supertest';
import TestAgent from 'supertest/lib/agent';

import { AdminRepository } from '@admin/repository/admin.repository';

import { REDIS_KEYS } from '@common/redis/redis.constant';
import { RedisService } from '@common/redis/redis.service';

import { Rss } from '@rss/entity/rss.entity';
import {
  RssAcceptRepository,
  RssRepository,
} from '@rss/repository/rss.repository';

import { AdminFixture } from '@test/config/common/fixture/admin.fixture';
import { RssFixture } from '@test/config/common/fixture/rss.fixture';
import { testApp } from '@test/config/e2e/env/jest.setup';

const URL = '/api/rss/accept';

describe(`POST ${URL}/{rssId} E2E Test`, () => {
  let agent: TestAgent;
  let rssRepository: RssRepository;
  let rssAcceptRepository: RssAcceptRepository;
  let adminRepository: AdminRepository;
  let redisService: RedisService;
  let rss: Rss;
  const redisKeyMake = (data: string) => `${REDIS_KEYS.ADMIN_AUTH_KEY}:${data}`;
  const sessionKey = 'admin-rss-accept';

  beforeAll(() => {
    agent = supertest(testApp.getHttpServer());
    rssRepository = testApp.get(RssRepository);
    rssAcceptRepository = testApp.get(RssAcceptRepository);
    redisService = testApp.get(RedisService);
    adminRepository = testApp.get(AdminRepository);
  });

  beforeEach(async () => {
    const admin = await adminRepository.save(
      await AdminFixture.createAdminCryptFixture(),
    );
    [rss] = await Promise.all([
      rssRepository.save(RssFixture.createRssFixture()),
      redisService.set(redisKeyMake(sessionKey), admin.email),
    ]);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('[401] 관리자 로그인 쿠키가 없을 경우 RSS 승인을 실패한다.', async () => {
    // Http when
    const response = await agent.post(`${URL}/${Number.MAX_SAFE_INTEGER}`);

    // Http then
    const { data } = response.body;
    expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
    expect(data).toBeUndefined();

    // DB, Redis when
    const [savedRssAccept, savedRss] = await Promise.all([
      rssAcceptRepository.findOneBy({
        rssUrl: rss.rssUrl,
      }),
      rssRepository.findOneBy({
        id: rss.id,
      }),
    ]);

    // DB, Redis then
    expect(savedRssAccept).toBeNull();
    expect(savedRss).not.toBeNull();
  });

  it('[401] 관리자 로그인 쿠키가 만료됐을 경우 RSS 승인을 실패한다.', async () => {
    // Http when
    const response = await agent
      .post(`${URL}/${Number.MAX_SAFE_INTEGER}`)
      .set('Cookie', `sessionId=Wrong${sessionKey}`);

    // Http then
    const { data } = response.body;
    expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
    expect(data).toBeUndefined();

    // DB, Redis when
    const [savedRssAccept, savedRss] = await Promise.all([
      rssAcceptRepository.findOneBy({
        rssUrl: rss.rssUrl,
      }),
      rssRepository.findOneBy({
        id: rss.id,
      }),
    ]);

    // DB, Redis then
    expect(savedRssAccept).toBeNull();
    expect(savedRss).not.toBeNull();
  });

  it('[404] 대기 목록에 없는 RSS를 승인할 경우 RSS 승인을 실패한다.', async () => {
    // Http when
    const response = await agent
      .post(`${URL}/${Number.MAX_SAFE_INTEGER}`)
      .set('Cookie', `sessionId=${sessionKey}`);

    // Http then
    const { data } = response.body;
    expect(response.status).toBe(HttpStatus.NOT_FOUND);
    expect(data).toBeUndefined();

    // DB, Redis when
    const [savedRssAccept, savedRss] = await Promise.all([
      rssAcceptRepository.findOneBy({
        rssUrl: rss.rssUrl,
      }),
      rssRepository.findOneBy({
        id: rss.id,
      }),
    ]);

    // DB, Redis then
    expect(savedRssAccept).toBeNull();
    expect(savedRss).not.toBeNull();
  });

  it('[400] 잘못된 RSS URL을 승인할 경우 RSS 승인을 실패한다.', async () => {
    // given
    jest.spyOn(axios, 'get').mockRejectedValue(new Error('Request failed'));

    // Http when
    const response = await agent
      .post(`${URL}/${rss.id}`)
      .set('Cookie', `sessionId=${sessionKey}`);

    // Http then
    const { data } = response.body;
    expect(response.status).toBe(HttpStatus.BAD_REQUEST);
    expect(data).toBeUndefined();

    // DB, Redis when
    const [savedRssAccept, savedRss] = await Promise.all([
      rssAcceptRepository.findOneBy({
        rssUrl: rss.rssUrl,
      }),
      rssRepository.findOneBy({
        id: rss.id,
      }),
    ]);

    // DB, Redis then
    expect(savedRssAccept).toBeNull();
    expect(savedRss).not.toBeNull();
  });

  it('[201] 관리자 로그인이 되어 있을 경우 RSS 승인을 성공한다.', async () => {
    // given
    jest
      .spyOn(axios, 'get')
      .mockResolvedValue({ data: '', status: HttpStatus.OK });

    // Http when
    const response = await agent
      .post(`${URL}/${rss.id}`)
      .set('Cookie', `sessionId=${sessionKey}`);

    // Http then
    const { data } = response.body;
    expect(response.status).toBe(HttpStatus.CREATED);
    expect(data).toBeUndefined();

    // DB, Redis when
    const [savedRssAccept, savedRss] = await Promise.all([
      rssAcceptRepository.findOneBy({
        rssUrl: rss.rssUrl,
      }),
      rssRepository.findOneBy({
        id: rss.id,
      }),
    ]);

    // DB, Redis then
    expect(savedRssAccept).not.toBeNull();
    expect(savedRss).toBeNull();
  });
});
