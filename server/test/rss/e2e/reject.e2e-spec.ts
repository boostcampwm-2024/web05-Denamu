import { HttpStatus, INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { RssFixture } from '../../fixture/rss.fixture';
import { RedisService } from '../../../src/common/redis/redis.service';
import { RejectRssRequestDto } from '../../../src/rss/dto/request/rejectRss';
import {
  RssRejectRepository,
  RssRepository,
} from '../../../src/rss/repository/rss.repository';
import { REDIS_KEYS } from '../../../src/common/redis/redis.constant';

describe('POST /api/rss/reject/{rssId} E2E Test', () => {
  let app: INestApplication;
  let rssRepository: RssRepository;
  let rssRejectRepository: RssRejectRepository;
  let redisService: RedisService;

  beforeAll(async () => {
    app = global.testApp;
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

  describe('정상적인 요청을 한다.', () => {
    it('[201] 정상적으로 RSS를 거절한다.', async () => {
      // given
      const REJECT_REASON = '거절 사유';
      const rss = await rssRepository.save(RssFixture.createRssFixture());
      const rejectRssDto = new RejectRssRequestDto({
        description: REJECT_REASON,
      });

      // when
      const response = await request(app.getHttpServer())
        .post(`/api/rss/reject/${rss.id}`)
        .set('Cookie', 'sessionId=testSessionId')
        .send(rejectRssDto);

      const accepted = await rssRejectRepository.findOne({
        where: { description: REJECT_REASON },
      });

      // then
      expect(response.status).toBe(HttpStatus.CREATED);
      expect(accepted).not.toBeNull();
    });
  });

  describe('비정상적인 요청을 한다.', () => {
    it('[404] 존재하지 않는 rss를 거절할 때', async () => {
      // given
      const REJECT_REASON = '거절 사유';
      const rejectRssDto = new RejectRssRequestDto({
        description: REJECT_REASON,
      });

      // when
      const response = await request(app.getHttpServer())
        .post(`/api/rss/reject/1`)
        .set('Cookie', 'sessionId=testSessionId')
        .send(rejectRssDto);

      // then
      expect(response.status).toBe(HttpStatus.NOT_FOUND);
    });

    it('[401] 유효한 세션이 존재하지 않을 때', async () => {
      // when
      const noCookieResponse = await request(app.getHttpServer())
        .post(`/api/rss/reject/1`)
        .send();

      const noSessionResponse = await request(app.getHttpServer())
        .post(`/api/rss/reject/1`)
        .set('Cookie', 'sessionId=invalid')
        .send();

      // then
      expect(noCookieResponse.status).toBe(HttpStatus.UNAUTHORIZED);
      expect(noSessionResponse.status).toBe(HttpStatus.UNAUTHORIZED);
    });
  });
});
