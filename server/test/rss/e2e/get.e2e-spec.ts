import { HttpStatus, INestApplication } from '@nestjs/common';
import * as supertest from 'supertest';
import { RssFixture } from '../../fixture/rss.fixture';
import {
  RssAcceptRepository,
  RssRepository,
} from '../../../src/rss/repository/rss.repository';
import TestAgent from 'supertest/lib/agent';

describe('GET /api/rss E2E Test', () => {
  let app: INestApplication;
  let agent: TestAgent;
  let rssRepository: RssRepository;
  let rssAcceptRepository: RssAcceptRepository;

  beforeAll(() => {
    app = global.testApp;
    agent = supertest(app.getHttpServer());
    rssRepository = app.get(RssRepository);
    rssAcceptRepository = app.get(RssAcceptRepository);
  });

  beforeEach(async () => {
    await rssRepository.delete({});
  });

  it('[200] 신청된 RSS가 없을 경우 RSS 신청 조회를 성공한다.', async () => {
    // when
    const response = await agent.get('/api/rss');

    // then
    const { data } = response.body;
    expect(response.status).toBe(HttpStatus.OK);
    expect(data).toStrictEqual([]);
  });

  it('[200] 신청된 RSS가 있을 경우 RSS 신청 조회를 성공한다.', async () => {
    // given
    const rss = await rssRepository.save(RssFixture.createRssFixture());

    // when
    const response = await agent.get('/api/rss');

    //then
    const { data } = response.body;
    expect(response.status).toBe(HttpStatus.OK);
    expect(data).toStrictEqual([
      {
        id: rss.id,
        name: rss.name,
        userName: rss.userName,
        email: rss.email,
        rssUrl: rss.rssUrl,
      },
    ]);
  });
});
