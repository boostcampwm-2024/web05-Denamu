import { HttpStatus, INestApplication } from '@nestjs/common';
import * as supertest from 'supertest';
import { RedisService } from '../../../../src/common/redis/redis.service';
import { RssRejectRepository } from '../../../../src/rss/repository/rss.repository';
import { RssReject } from '../../../../src/rss/entity/rss.entity';
import { RssRejectFixture } from '../../../fixture/rss-reject.fixture';
import TestAgent from 'supertest/lib/agent';

const URL = '/api/rss/history/reject';

describe(`GET ${URL} E2E Test`, () => {
  let app: INestApplication;
  let agent: TestAgent;
  let rssRejectList: RssReject[];

  beforeAll(async () => {
    app = global.testApp;
    agent = supertest(app.getHttpServer());
    const rssRejectRepository = app.get(RssRejectRepository);
    const redisService = app.get(RedisService);
    const rssAccepts = Array.from({ length: 2 }).map((_, i) =>
      RssRejectFixture.createRssRejectFixture({}, i),
    );
    [rssRejectList] = await Promise.all([
      rssRejectRepository.save(rssAccepts),
      redisService.set('auth:testSessionId', 'test1234'),
    ]);
    rssRejectList.reverse();
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
    const response = await agent.get(URL).set('Cookie', 'sessionId=invalid');

    // Http then
    const { data } = response.body;
    expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
    expect(data).toBeUndefined();
  });

  it('[200] 관리자 로그인이 되어 있을 경우 RSS 거절 기록 조회를 성공한다.', async () => {
    // Http when
    const response = await agent
      .get(URL)
      .set('Cookie', 'sessionId=testSessionId');

    // Http then
    const { data } = response.body;
    expect(response.status).toBe(HttpStatus.OK);
    expect(data).toStrictEqual(
      Array.from({ length: 2 }).map((_, i) => {
        const rssReject = rssRejectList[i];
        return {
          id: rssReject.id,
          name: rssReject.name,
          userName: rssReject.userName,
          email: rssReject.email,
          rssUrl: rssReject.rssUrl,
          description: rssReject.description,
        };
      }),
    );
  });
});
