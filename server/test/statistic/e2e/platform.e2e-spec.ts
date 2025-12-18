import { HttpStatus, INestApplication } from '@nestjs/common';
import * as supertest from 'supertest';
import { RssAcceptRepository } from '../../../src/rss/repository/rss.repository';
import { RssAcceptFixture } from '../../config/common/fixture/rss-accept.fixture';
import TestAgent from 'supertest/lib/agent';
import { RssAccept } from '../../../src/rss/entity/rss.entity';

const URL = '/api/statistic/platform';

describe(`GET ${URL} E2E Test`, () => {
  let app: INestApplication;
  let agent: TestAgent;
  let rssAcceptRepository: RssAcceptRepository;
  let rssAcceptList: RssAccept[];

  beforeAll(async () => {
    app = global.testApp;
    agent = supertest(app.getHttpServer());
    rssAcceptRepository = app.get(RssAcceptRepository);
  });

  beforeEach(async () => {
    rssAcceptList = await Promise.all([
      rssAcceptRepository.save(RssAcceptFixture.createRssAcceptFixture()),
      rssAcceptRepository.save(RssAcceptFixture.createRssAcceptFixture()),
      rssAcceptRepository.save(
        RssAcceptFixture.createRssAcceptFixture({ blogPlatform: 'velog' }),
      ),
    ]);
  });

  afterEach(async () => {
    await rssAcceptRepository.delete(
      rssAcceptList.map((rssAccept) => rssAccept.id),
    );
  });

  it('[200] 블로그 플랫폼별 통계 요청을 받은 경우 블로그 플랫폼별 개수 통계 조회를 성공한다.', async () => {
    // Http when
    const response = await agent.get(URL);

    // Http then
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
