import { HttpStatus, INestApplication } from '@nestjs/common';
import {
  RssAcceptRepository,
  RssRepository,
} from '../../../src/rss/repository/rss.repository';
import { RssFixture } from '../../fixture/rss.fixture';
import * as request from 'supertest';
import { DeleteRssRequestDto } from '../../../src/rss/dto/request/deleteRss.dto';
import TestAgent from 'supertest/lib/agent';

describe('POST /api/rss/remove E2E Test', () => {
  let app: INestApplication;
  let agent: TestAgent;
  let rssRepository: RssRepository;
  let rssAcceptRepository: RssAcceptRepository;

  beforeAll(() => {
    app = global.testApp;
    agent = request.agent(app.getHttpServer());
    rssRepository = app.get(RssRepository);
    rssAcceptRepository = app.get(RssAcceptRepository);
  });

  it('[404] RSS가 없을 경우 신청할 수 없다.', async () => {
    // given
    const requestDto = new DeleteRssRequestDto({
      blogUrl: 'https://test.com',
      email: 'test@test.com',
    });

    // when
    const response = await agent.post('/api/rss/remove').send(requestDto);

    // then
    expect(response.status).toBe(HttpStatus.NOT_FOUND);
  });

  it('[200] 대기 RSS가 있을 경우 신청할 수 있다.', async () => {
    // given
    const rss = await rssRepository.save(RssFixture.createRssFixture());
    const requestDto = new DeleteRssRequestDto({
      blogUrl: rss.rssUrl,
      email: rss.email,
    });

    // when
    const response = await agent.post('/api/rss/remove').send(requestDto);

    // then
    expect(response.status).toBe(HttpStatus.OK);
  });

  it('[200] 승인된 RSS가 있을 경우 신청할 수 있다.', async () => {
    // given
    const rss = await rssAcceptRepository.save(RssFixture.createRssFixture());
    const requestDto = new DeleteRssRequestDto({
      blogUrl: rss.rssUrl,
      email: rss.email,
    });

    // when
    const response = await agent.post('/api/rss/remove').send(requestDto);

    // then
    expect(response.status).toBe(HttpStatus.OK);
  });
});
