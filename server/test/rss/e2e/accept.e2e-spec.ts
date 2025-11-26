import { HttpStatus, INestApplication } from '@nestjs/common';
import * as supertest from 'supertest';
import { RssFixture } from '../../fixture/rss.fixture';
import { RedisService } from '../../../src/common/redis/redis.service';
import {
  RssAcceptRepository,
  RssRepository,
} from '../../../src/rss/repository/rss.repository';
import { REDIS_KEYS } from '../../../src/common/redis/redis.constant';
import TestAgent from 'supertest/lib/agent';

const URL = '/api/rss/accept';

describe(`POST ${URL}/{rssId} E2E Test`, () => {
  let app: INestApplication;
  let agent: TestAgent;
  let rssRepository: RssRepository;
  let rssAcceptRepository: RssAcceptRepository;
  let redisService: RedisService;

  beforeAll(async () => {
    app = global.testApp;
    agent = supertest(app.getHttpServer());
    rssRepository = app.get(RssRepository);
    rssAcceptRepository = app.get(RssAcceptRepository);
    redisService = app.get(RedisService);
  });

  beforeEach(async () => {
    await Promise.all([
      rssRepository.delete({}),
      redisService.set(
        `${REDIS_KEYS.ADMIN_AUTH_KEY}:testSessionId`,
        'test_admin',
      ),
    ]);
  });

  it('[401] 관리자 로그인 쿠키가 없을 경우 RSS 승인을 실패한다.', async () => {
    // when
    const response = await agent.post(`${URL}/${Number.MAX_SAFE_INTEGER}`);

    // then
    const { data } = response.body;
    expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
    expect(data).toBeUndefined();
  });

  it('[401] 관리자 로그인 쿠키가 만료됐을 경우 RSS 승인을 실패한다.', async () => {
    // when
    const response = await agent
      .post(`${URL}/${Number.MAX_SAFE_INTEGER}`)
      .set('Cookie', 'sessionId=invalid');

    // then
    const { data } = response.body;
    expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
    expect(data).toBeUndefined();
  });

  it('[404] 대기 목록에 없는 RSS를 승인할 경우 RSS 승인을 실패한다.', async () => {
    // when
    const response = await agent
      .post(`${URL}/${Number.MAX_SAFE_INTEGER}`)
      .set('Cookie', 'sessionId=testSessionId');

    // then
    const { data } = response.body;
    expect(response.status).toBe(HttpStatus.NOT_FOUND);
    expect(data).toBeUndefined();
  });

  it('[400] 잘못된 RSS URL을 승인할 경우 RSS 승인을 실패한다.', async () => {
    // given
    const rss = await rssRepository.save(RssFixture.createRssFixture());
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: HttpStatus.BAD_REQUEST,
    });

    // when
    const response = await agent
      .post(`${URL}/${rss.id}`)
      .set('Cookie', 'sessionId=testSessionId');

    // then
    const { data } = response.body;
    expect(response.status).toBe(HttpStatus.BAD_REQUEST);
    expect(data).toBeUndefined();
  });

  it('[201] 관리자 로그인이 되어 있을 경우 RSS 승인을 성공한다.', async () => {
    // given
    const rss = await rssRepository.save(RssFixture.createRssFixture());
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: HttpStatus.OK,
    });

    // when
    const response = await agent
      .post(`${URL}/${rss.id}`)
      .set('Cookie', 'sessionId=testSessionId');

    // then
    const { data } = response.body;
    expect(response.status).toBe(HttpStatus.CREATED);
    expect(data).toBeUndefined();

    // cleanup
    await rssAcceptRepository.delete({ rssUrl: rss.rssUrl });
  });
});
