import { HttpStatus } from '@nestjs/common';
import * as supertest from 'supertest';
import { RssAcceptRepository } from '../../../src/rss/repository/rss.repository';
import { RssAcceptFixture } from '../../config/common/fixture/rss-accept.fixture';
import TestAgent from 'supertest/lib/agent';
import { testApp } from '../../config/e2e/env/jest.setup';

const URL = '/api/statistic/platform';

describe(`GET ${URL} E2E Test`, () => {
  let agent: TestAgent;
  let rssAcceptRepository: RssAcceptRepository;

  beforeAll(async () => {
    agent = supertest(testApp.getHttpServer());
    rssAcceptRepository = testApp.get(RssAcceptRepository);
  });

  beforeEach(async () => {
    await Promise.all([
      rssAcceptRepository.insert(RssAcceptFixture.createRssAcceptFixture()),
      rssAcceptRepository.insert(RssAcceptFixture.createRssAcceptFixture()),
      rssAcceptRepository.insert(
        RssAcceptFixture.createRssAcceptFixture({ blogPlatform: 'velog' }),
      ),
    ]);
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
