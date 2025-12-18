import { RssRejectRepository } from './../../../src/rss/repository/rss.repository';
import { HttpStatus, INestApplication } from '@nestjs/common';
import * as supertest from 'supertest';
import { RssFixture } from '../../config/common/fixture/rss.fixture';
import { RedisService } from '../../../src/common/redis/redis.service';
import { RejectRssRequestDto } from '../../../src/rss/dto/request/rejectRss';
import { RssRepository } from '../../../src/rss/repository/rss.repository';
import { REDIS_KEYS } from '../../../src/common/redis/redis.constant';
import TestAgent from 'supertest/lib/agent';
import { Rss } from '../../../src/rss/entity/rss.entity';

const URL = '/api/rss/reject';

describe(`POST ${URL}/{rssId} E2E Test`, () => {
  let app: INestApplication;
  let agent: TestAgent;
  let rssRepository: RssRepository;
  let rssRejectRepository: RssRejectRepository;
  let redisService: RedisService;
  let rss: Rss;
  const redisKeyMake = (data: string) => `${REDIS_KEYS.ADMIN_AUTH_KEY}:${data}`;
  const sessionKey = 'admin-rss-reject';

  beforeAll(() => {
    app = global.testApp;
    agent = supertest(app.getHttpServer());
    rssRepository = app.get(RssRepository);
    rssRejectRepository = app.get(RssRejectRepository);
    redisService = app.get(RedisService);
  });

  beforeEach(async () => {
    await redisService.set(redisKeyMake(sessionKey), 'test1234');
    rss = await rssRepository.save(RssFixture.createRssFixture());
  });

  afterEach(async () => {
    await redisService.del(redisKeyMake(sessionKey));
    await rssRepository.delete(rss.id);
  });

  it('[401] 관리자 로그인 쿠키가 없을 경우 RSS 거부를 실패한다.', async () => {
    // Http when
    const response = await agent.post(`${URL}/${Number.MAX_SAFE_INTEGER}`);

    // Http then
    const { data } = response.body;
    expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
    expect(data).toBeUndefined();

    // DB, Redis when
    const savedRss = await rssRepository.findOneBy({ id: rss.id });
    const savedRssReject = await rssRejectRepository.findOneBy({
      rssUrl: rss.rssUrl,
      userName: rss.userName,
    });

    // DB, Redis then
    expect(savedRss).not.toBeNull();
    expect(savedRssReject).toBeNull();
  });

  it('[401] 관리자 로그인 쿠키가 만료됐을 경우 RSS 거부를 실패한다.', async () => {
    // Http when
    const response = await agent
      .post(`${URL}/${Number.MAX_SAFE_INTEGER}`)
      .set('Cookie', `sessionId=Wrong${sessionKey}`);

    // Http then
    const { data } = response.body;
    expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
    expect(data).toBeUndefined();

    // DB, Redis when
    const savedRss = await rssRepository.findOneBy({ id: rss.id });
    const savedRssReject = await rssRejectRepository.findOneBy({
      rssUrl: rss.rssUrl,
      userName: rss.userName,
    });

    // DB, Redis then
    expect(savedRss).not.toBeNull();
    expect(savedRssReject).toBeNull();
  });

  it('[404] 존재하지 않는 RSS를 거부할 경우 RSS 거부를 실패한다.', async () => {
    // given
    const REJECT_REASON = '거절 사유';
    const requestDTO = new RejectRssRequestDto({
      description: REJECT_REASON,
    });

    // Http when
    const response = await agent
      .post(`${URL}/${Number.MAX_SAFE_INTEGER}`)
      .set('Cookie', `sessionId=${sessionKey}`)
      .send(requestDTO);

    // Http then
    const { data } = response.body;
    expect(response.status).toBe(HttpStatus.NOT_FOUND);
    expect(data).toBeUndefined();

    // DB, Redis when
    const savedRss = await rssRepository.findOneBy({ id: rss.id });
    const savedRssReject = await rssRejectRepository.findOneBy({
      rssUrl: rss.rssUrl,
      userName: rss.userName,
    });

    // DB, Redis then
    expect(savedRss).not.toBeNull();
    expect(savedRssReject).toBeNull();
  });

  it('[201] 신청된 RSS를 거부할 경우 RSS 거부를 성공한다.', async () => {
    // given
    const REJECT_REASON = '거절 사유';
    const requestDto = new RejectRssRequestDto({
      description: REJECT_REASON,
    });

    // Http when
    const response = await agent
      .post(`${URL}/${rss.id}`)
      .set('Cookie', `sessionId=${sessionKey}`)
      .send(requestDto);

    // Http then
    const { data } = response.body;
    expect(response.status).toBe(HttpStatus.CREATED);
    expect(data).toBeUndefined();

    // DB, Redis when
    const savedRssReject = await rssRejectRepository.findOneBy({
      rssUrl: rss.rssUrl,
      userName: rss.userName,
      name: rss.name,
      email: rss.email,
      description: REJECT_REASON,
    });
    const savedRss = await rssRepository.findOneBy({ id: rss.id });

    // DB, Redis then
    expect(savedRssReject).not.toBeNull();
    expect(savedRss).toBeNull();

    // cleanup
    await rssRejectRepository.delete(savedRssReject.id);
  });
});
