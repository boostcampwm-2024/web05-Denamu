import { HttpStatus, INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { RedisService } from '../../../src/common/redis/redis.service';

describe('Rss Remove E2E Test', () => {
  let app: INestApplication;
  let redisService: RedisService;

  beforeAll(async () => {
    app = global.testApp;
    redisService = app.get(RedisService);
  });

  beforeEach(async () => {
    await redisService.set('auth:sid', 'test_admin');
  });

  describe('GET /rss/remove E2E TEST', () => {
    it('[401] 관리자 권한이 없을 경우', async () => {
      // when
      const response = await request(app.getHttpServer())
        .get('/api/rss/remove')
        .send();

      // then
      expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
    });
    it('[200] 관리자 권한이 있을 경우', async () => {
      // when
      const response = await request(app.getHttpServer())
        .get('/api/rss/remove')
        .set('Cookie', 'sessionId=sid')
        .send();

      // then
      expect(response.status).toBe(HttpStatus.OK);
    });
  });
});
