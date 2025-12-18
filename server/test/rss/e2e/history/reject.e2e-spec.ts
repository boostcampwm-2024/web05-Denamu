import { HttpStatus, INestApplication } from '@nestjs/common';
import * as supertest from 'supertest';
import { RedisService } from '../../../../src/common/redis/redis.service';
import { RssRejectRepository } from '../../../../src/rss/repository/rss.repository';
import { RssReject } from '../../../../src/rss/entity/rss.entity';
import { RssRejectFixture } from '../../../config/common/fixture/rss-reject.fixture';
import TestAgent from 'supertest/lib/agent';
import { REDIS_KEYS } from '../../../../src/common/redis/redis.constant';

const URL = '/api/rss/history/reject';

describe(`GET ${URL} E2E Test`, () => {
  let app: INestApplication;
  let agent: TestAgent;
  let rssRejectList: RssReject[];
  let redisService: RedisService;
  let rssRejectRepository: RssRejectRepository;
  const redisKeyMake = (data: string) => `${REDIS_KEYS.ADMIN_AUTH_KEY}:${data}`;
  const sessionKey = 'admin-rss-history-reject';

  beforeAll(async () => {
    app = global.testApp;
    agent = supertest(app.getHttpServer());
    rssRejectRepository = app.get(RssRejectRepository);
    redisService = app.get(RedisService);
  });

  beforeEach(async () => {
    const rssRejects = Array.from({ length: 2 }).map((_, i) =>
      RssRejectFixture.createRssRejectFixture(),
    );
    [rssRejectList] = await Promise.all([
      rssRejectRepository.save(rssRejects),
      redisService.set(redisKeyMake(sessionKey), 'test1234'),
    ]);
    rssRejectList.reverse();
  });

  afterEach(async () => {
    await Promise.all([
      rssRejectRepository.delete(
        rssRejectList.map((rssReject) => rssReject.id),
      ),
      redisService.del(redisKeyMake(sessionKey)),
    ]);
  });

  it('[401] 관리자 로그인 쿠키가 없을 경우 RSS 거절 기록 조회를 실패한다.', async () => {
    // Http when
    const response = await agent.get(URL);

    // Http then
    const { data } = response.body;
    expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
    expect(data).toBeUndefined();
  });

  it('[401] 관리자 로그인 쿠키가 만료됐을 경우 RSS 거절 기록 조회를 실패한다.', async () => {
    // Http when
    const response = await agent
      .get(URL)
      .set('Cookie', `sessionId=Wrong${sessionKey}`);

    // Http then
    const { data } = response.body;
    expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
    expect(data).toBeUndefined();
  });

  it('[200] 관리자 로그인이 되어 있을 경우 RSS 거절 기록 조회를 성공한다.', async () => {
    // Http when
    const response = await agent
      .get(URL)
      .set('Cookie', `sessionId=${sessionKey}`);

    // Http then
    const { data } = response.body;
    expect(response.status).toBe(HttpStatus.OK);
    expect(data).toStrictEqual(
      rssRejectList.map((rssReject) => ({
        description: rssReject.description,
        email: rssReject.email,
        id: rssReject.id,
        name: rssReject.name,
        rssUrl: rssReject.rssUrl,
        userName: rssReject.userName,
      })),
    );
  });
});
