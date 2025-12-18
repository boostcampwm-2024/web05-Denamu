import { HttpStatus, INestApplication } from '@nestjs/common';
import * as supertest from 'supertest';
import { RssFixture } from '../../config/common/fixture/rss.fixture';
import { RedisService } from '../../../src/common/redis/redis.service';
import {
  RssAcceptRepository,
  RssRepository,
} from '../../../src/rss/repository/rss.repository';
import { REDIS_KEYS } from '../../../src/common/redis/redis.constant';
import TestAgent from 'supertest/lib/agent';
import { Rss } from '../../../src/rss/entity/rss.entity';

const URL = '/api/rss/accept';

describe(`POST ${URL}/{rssId} E2E Test`, () => {
  let app: INestApplication;
  let agent: TestAgent;
  let rssRepository: RssRepository;
  let rssAcceptRepository: RssAcceptRepository;
  let redisService: RedisService;
  let rss: Rss;
  const redisKeyMake = (data: string) => `${REDIS_KEYS.ADMIN_AUTH_KEY}:${data}`;
  const sessionKey = 'admin-rss-accept';

  beforeAll(async () => {
    app = global.testApp;
    agent = supertest(app.getHttpServer());
    rssRepository = app.get(RssRepository);
    rssAcceptRepository = app.get(RssAcceptRepository);
    redisService = app.get(RedisService);
  });

  beforeEach(async () => {
    [rss] = await Promise.all([
      rssRepository.save(RssFixture.createRssFixture()),
      redisService.set(redisKeyMake(sessionKey), 'test1234'),
    ]);
  });

  afterEach(async () => {
    await Promise.all([
      rssRepository.delete(rss.id),
      redisService.del(redisKeyMake(sessionKey)),
    ]);
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
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: HttpStatus.BAD_REQUEST,
    });

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
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: HttpStatus.OK,
    });

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

    // cleanup
    await rssAcceptRepository.delete(savedRssAccept.id);
  });
});
