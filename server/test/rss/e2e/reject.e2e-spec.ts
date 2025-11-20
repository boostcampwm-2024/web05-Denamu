import { HttpStatus, INestApplication } from '@nestjs/common';
import * as supertest from 'supertest';
import { RssFixture } from '../../fixture/rss.fixture';
import { RedisService } from '../../../src/common/redis/redis.service';
import { RejectRssRequestDto } from '../../../src/rss/dto/request/rejectRss';
import {
  RssRejectRepository,
  RssRepository,
} from '../../../src/rss/repository/rss.repository';
import { REDIS_KEYS } from '../../../src/common/redis/redis.constant';
import TestAgent from 'supertest/lib/agent';

describe('POST /api/rss/reject/{rssId} E2E Test', () => {
  let app: INestApplication;
  let agent: TestAgent;
  let rssRepository: RssRepository;
  let rssRejectRepository: RssRejectRepository;
  let redisService: RedisService;

  beforeAll(async () => {
    app = global.testApp;
    agent = supertest(app.getHttpServer());
    rssRepository = app.get(RssRepository);
    rssRejectRepository = app.get(RssRejectRepository);
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

  it('[201] 신청된 RSS를 거부할 경우 RSS 거부를 성공한다.', async () => {
    // given
    const REJECT_REASON = '거절 사유';
    const rss = await rssRepository.save(RssFixture.createRssFixture());
    const requestDto = new RejectRssRequestDto({
      description: REJECT_REASON,
    });

    // when
    const response = await agent
      .post(`/api/rss/reject/${rss.id}`)
      .set('Cookie', 'sessionId=testSessionId')
      .send(requestDto);

    const accepted = await rssRejectRepository.findOne({
      where: { description: REJECT_REASON },
    });

    // then
    expect(response.status).toBe(HttpStatus.CREATED);
    expect(accepted).not.toBeNull();
  });

  it('[404] 존재하지 않는 RSS를 거부할 경우 RSS 거부를 실패한다.', async () => {
    // given
    const REJECT_REASON = '거절 사유';
    const requestDTO = new RejectRssRequestDto({
      description: REJECT_REASON,
    });

    // when
    const response = await agent
      .post(`/api/rss/reject/${Number.MAX_SAFE_INTEGER}`)
      .set('Cookie', 'sessionId=testSessionId')
      .send(requestDTO);

    // then
    expect(response.status).toBe(HttpStatus.NOT_FOUND);
  });

  it('[401] 관리자 로그인이 되어 있지 않은 경우 RSS 거부를 실패한다.', async () => {
    // when
    const noCookieResponse = await agent.post(
      `/api/rss/reject/${Number.MAX_SAFE_INTEGER}`,
    );
    const noSessionResponse = await agent
      .post(`/api/rss/reject/${Number.MAX_SAFE_INTEGER}`)
      .set('Cookie', 'sessionId=invalid');

    // then
    expect(noCookieResponse.status).toBe(HttpStatus.UNAUTHORIZED);
    expect(noSessionResponse.status).toBe(HttpStatus.UNAUTHORIZED);
  });
});
