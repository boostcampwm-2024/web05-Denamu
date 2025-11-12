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

  it('[200] RSS가 등록되지 않은 경우 빈 리스트를 반환한다.', async () => {
    // when
    const response = await agent.get('/api/rss');

    // then
    expect(response.status).toBe(HttpStatus.OK);
    expect(response.body.data).toEqual([]);
  });

  it('[200] 등록된 RSS가 존재할 경우 해당 데이터를 반환한다.', async () => {
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
