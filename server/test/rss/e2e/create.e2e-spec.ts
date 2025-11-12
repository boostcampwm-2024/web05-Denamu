import { HttpStatus, INestApplication } from '@nestjs/common';
import { RegisterRssRequestDto } from '../../../src/rss/dto/request/registerRss.dto';
import * as supertest from 'supertest';
import { RssAcceptFixture } from '../../fixture/rss-accept.fixture';
import {
  RssAcceptRepository,
  RssRepository,
} from '../../../src/rss/repository/rss.repository';
import TestAgent from 'supertest/lib/agent';

describe('POST /api/rss E2E Test', () => {
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

  it('[201] 정상적인 요청이 들어왔다면 올바른 응답을 한다.', async () => {
    // given
    const requestDto = new RegisterRssRequestDto({
      blog: 'blog1',
      name: 'name1',
      email: 'test1@test.com',
      rssUrl: 'https://example1.com/rss',
    });

    // when
    const response = await agent.post('/api/rss').send(requestDto);

    // then
    expect(response.status).toBe(HttpStatus.CREATED);
  });

  it('[409] 이미 신청한 RSS를 또 신청한다면 거부를 한다.', async () => {
    // given
    const requestDto = new RegisterRssRequestDto({
      blog: 'blog1',
      name: 'name1',
      email: 'test1@test.com',
      rssUrl: 'https://example1.com/rss',
    });
    await agent.post('/api/rss').send(requestDto);

    // when
    const response = await agent.post('/api/rss').send(requestDto);

    // then
    expect(response.status).toBe(HttpStatus.CONFLICT);
  });

  it('[409] 이미 등록된 RSS를 또 신청한다면 거부를 한다.', async () => {
    // given
    const acceptedRss = await rssAcceptRepository.save(
      RssAcceptFixture.createRssAcceptFixture(),
    );
    const requestDto = new RegisterRssRequestDto({
      blog: acceptedRss.name,
      name: acceptedRss.userName,
      email: acceptedRss.email,
      rssUrl: acceptedRss.rssUrl,
    });

    // when
    const response = await agent.post('/api/rss').send(requestDto);

    // then
    expect(response.status).toBe(HttpStatus.CONFLICT);
  });
});
