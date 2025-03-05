import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { Repository } from 'typeorm';
import { Rss, RssReject } from '../../../src/rss/entity/rss.entity';
import { RssFixture } from '../../fixture/rss.fixture';
import { RedisService } from '../../../src/common/redis/redis.service';
import { RejectRssRequestDto } from '../../../src/rss/dto/request/rss-reject.dto';
import {
  RssRejectRepository,
  RssRepository,
} from '../../../src/rss/repository/rss.repository';

describe('Rss Reject E2E Test', () => {
  let app: INestApplication;
  let rssRepository: Repository<Rss>;
  let rssRejectRepository: Repository<RssReject>;
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
      redisService.set('auth:sid', 'test_admin'),
    ]);
  });

  describe('POST /api/rss/reject/{rssId}', () => {
    describe('정상적인 요청을 한다.', () => {
      it('정상적으로 RSS를 거절한다.', async () => {
        // given
        const REJECT_REASON = '거절 사유';
        const rss = await rssRepository.save(RssFixture.createRssFixture());
        const rejectRssDto = new RejectRssRequestDto({
          description: REJECT_REASON,
        });

        // when
        const response = await request(app.getHttpServer())
          .post(`/api/rss/reject/${rss.id}`)
          .set('Cookie', 'sessionId=sid')
          .send(rejectRssDto);

        const accepted = await rssRejectRepository.findOne({
          where: { description: REJECT_REASON },
        });

        // then
        expect(response.status).toBe(201);
        expect(accepted).not.toBeNull();
      });
    });

    describe('비정상적인 요청을 한다.', () => {
      it('존재하지 않는 rss를 거절할 때', async () => {
        // given
        const REJECT_REASON = '거절 사유';
        const rejectRssDto = new RejectRssRequestDto({
          description: REJECT_REASON,
        });

        // when
        const response = await request(app.getHttpServer())
          .post(`/api/rss/reject/1`)
          .set('Cookie', 'sessionId=sid')
          .send(rejectRssDto);

        // then
        expect(response.status).toBe(404);
      });

      it('유효한 세션이 존재하지 않을 때', async () => {
        // when
        const noCookieResponse = await request(app.getHttpServer())
          .post(`/api/rss/reject/1`)
          .send();

        const noSessionResponse = await request(app.getHttpServer())
          .post(`/api/rss/reject/1`)
          .set('Cookie', 'sessionId=invalid')
          .send();

        // then
        expect(noCookieResponse.status).toBe(401);
        expect(noSessionResponse.status).toBe(401);
      });
    });
  });
});
