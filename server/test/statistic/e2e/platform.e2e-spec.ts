import { HttpStatus, INestApplication } from '@nestjs/common';
import * as supertest from 'supertest';
import { RssAcceptRepository } from '../../../src/rss/repository/rss.repository';
import { RssAcceptFixture } from '../../fixture/rss-accept.fixture';
import TestAgent from 'supertest/lib/agent';

const URL = '/api/statistic/platform';

describe(`GET ${URL} E2E Test`, () => {
  let app: INestApplication;
  let agent: TestAgent;

  beforeAll(async () => {
    app = global.testApp;
    agent = supertest(app.getHttpServer());
    const rssAcceptRepository = app.get(RssAcceptRepository);
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

  it('[200] 블로그 플랫폼별 통계 요청을 받은 경우 블로그 플랫폼별 개수 통계 조회를 성공한다.', async () => {
    // when
    const response = await agent.get(URL);

    // then
    const { data } = response.body;
    expect(response.status).toBe(HttpStatus.OK);
    expect(data).toStrictEqual([
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
