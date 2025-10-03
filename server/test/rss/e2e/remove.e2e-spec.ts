import { HttpStatus, INestApplication } from '@nestjs/common';
import {
  RssAcceptRepository,
  RssRepository,
} from '../../../src/rss/repository/rss.repository';
import { RssFixture } from '../../fixture/rss.fixture';
import * as request from 'supertest';

describe('POST /api/rss/remove E2E Test', () => {
  let app: INestApplication;
  let rssRepository: RssRepository;
  let rssAcceptRepository: RssAcceptRepository;

  beforeAll(() => {
    app = global.testApp;
    rssRepository = app.get(RssRepository);
    rssAcceptRepository = app.get(RssAcceptRepository);
  });

  it('[404] RSS가 없을 경우 신청할 수 없다.', async () => {
    // when
    const response = await request(app.getHttpServer())
      .post('/api/rss/remove')
      .send({
        blogUrl: 'https://test.com',
        userName: 'test',
        email: 'test@test.com',
      });
    // then
    expect(response.status).toBe(HttpStatus.NOT_FOUND);
  });

  it('[200] 대기 RSS가 있을 경우 신청할 수 있다.', async () => {
    // given
    const rss = await rssRepository.save(RssFixture.createRssFixture());

    // when
    const response = await request(app.getHttpServer())
      .post('/api/rss/remove')
      .send({
        blogUrl: rss.rssUrl,
        userName: rss.userName,
        email: rss.email,
      });

    // then
    expect(response.status).toBe(HttpStatus.OK);
  });

  it('[200] 승인된 RSS가 있을 경우 신청할 수 있다.', async () => {
    // given
    const rss = await rssAcceptRepository.save(RssFixture.createRssFixture());

    // when
    const response = await request(app.getHttpServer())
      .post('/api/rss/remove')
      .send({
        blogUrl: rss.rssUrl,
        userName: rss.userName,
        email: rss.email,
      });

    // then
    expect(response.status).toBe(HttpStatus.OK);
  });
});
