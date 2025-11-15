import { HttpStatus, INestApplication } from '@nestjs/common';
import * as supertest from 'supertest';
import { RssFixture } from '../../fixture/rss.fixture';
import {
  RssAcceptRepository,
  RssRepository,
} from '../../../src/rss/repository/rss.repository';

describe('GET /api/rss E2E Test', () => {
  let app: INestApplication;
  let agent: ReturnType<typeof supertest>;
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
    expect(response.status).toBe(HttpStatus.OK);
    expect(response.body.data).toEqual([]);
  });

  it('[200] 신청된 RSS가 있을 경우 RSS 신청 조회를 성공한다.', async () => {
    // given
    const expectedResult = await rssRepository.save(
      RssFixture.createRssFixture(),
    );

    // when
    const response = await agent.get('/api/rss');

    //then
    expect(response.status).toBe(HttpStatus.OK);
    expect(response.body.data).toEqual([expectedResult]);
  });
});
