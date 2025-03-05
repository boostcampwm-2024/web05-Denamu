import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { RssAcceptRepository } from '../../../src/rss/repository/rss.repository';
import { RssAcceptFixture } from '../../fixture/rssAccept.fixture';

describe('GET /api/statistic/platform E2E Test', () => {
  let app: INestApplication;
  let rssAcceptRepository: RssAcceptRepository;
  beforeAll(async () => {
    app = global.testApp;
    rssAcceptRepository = app.get(RssAcceptRepository);
    await Promise.all([
      rssAcceptRepository.insert(RssAcceptFixture.createRssAcceptFixture({})),
      rssAcceptRepository.insert(
        RssAcceptFixture.createRssAcceptFixture({}, 2),
      ),
      rssAcceptRepository.insert(
        RssAcceptFixture.createRssAcceptFixture({ blogPlatform: 'velog' }, 3),
      ),
    ]);
  });

  it('요청을 받으면 블로그 플랫폼별 통계 결과를 응답한다.', async () => {
    // when
    const response = await request(app.getHttpServer()).get(
      '/api/statistic/platform',
    );

    // then
    expect(response.status).toBe(200);
    expect(response.body.data).toStrictEqual([
      {
        platform: 'etc',
        count: 2,
      },
      {
        platform: 'velog',
        count: 1,
      },
    ]);
  });
});
