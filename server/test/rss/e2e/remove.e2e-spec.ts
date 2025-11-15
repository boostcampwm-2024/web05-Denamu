import { HttpStatus, INestApplication } from '@nestjs/common';
import {
  RssAcceptRepository,
  RssRepository,
} from '../../../src/rss/repository/rss.repository';
import { RssFixture } from '../../fixture/rss.fixture';
import * as supertest from 'supertest';
import { DeleteRssRequestDto } from '../../../src/rss/dto/request/deleteRss.dto';
import TestAgent from 'supertest/lib/agent';

describe('POST /api/rss/remove E2E Test', () => {
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

  it('[404] RSS가 없을 경우 RSS 삭제 신청을 실패한다.', async () => {
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

  it('[200] RSS 등록 요청이 있을 경우 RSS 삭제 신청을 성공한다.', async () => {
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

  it('[200] 이미 등록된 RSS가 있을 경우 RSS 삭제 신청을 성공한다.', async () => {
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
