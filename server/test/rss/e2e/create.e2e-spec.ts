import { HttpStatus, INestApplication } from '@nestjs/common';
import { RegisterRssRequestDto } from '../../../src/rss/dto/request/registerRss.dto';
import * as supertest from 'supertest';
import { RssAcceptFixture } from '../../fixture/rss-accept.fixture';
import {
  RssAcceptRepository,
  RssRepository,
} from '../../../src/rss/repository/rss.repository';
import TestAgent from 'supertest/lib/agent';
import { RssFixture } from '../../fixture/rss.fixture';

const URL = '/api/rss';

describe(`POST ${URL} E2E Test`, () => {
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

  it('[409] 이미 신청한 RSS를 다시 신청할 경우 RSS 등록 요청을 실패한다.', async () => {
    // given
    const rss = await rssRepository.save(RssFixture.createRssFixture());
    const requestDto = new RegisterRssRequestDto({
      blog: 'blog1',
      name: 'name1',
      email: 'test1@test.com',
      rssUrl: rss.rssUrl,
    });

    // when
    const response = await agent.post(URL).send(requestDto);

    // then
    const { data } = response.body;
    expect(response.status).toBe(HttpStatus.CONFLICT);
    expect(data).toBeUndefined();

    // cleanup
    await rssRepository.delete({ id: rss.id });
  });

  it('[409] 이미 등록 완료된 RSS를 다시 신청할 경우 RSS 등록 요청을 실패한다.', async () => {
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
    const response = await agent.post(URL).send(requestDto);

    // then
    const { data } = response.body;
    expect(response.status).toBe(HttpStatus.CONFLICT);
    expect(data).toBeUndefined();

    // cleanup
    await rssAcceptRepository.delete({ id: acceptedRss.id });
  });

  it('[201] 등록되지 않은 RSS 등록 요청을 받았을 경우 RSS 등록 요청을 성공한다.', async () => {
    // given
    const requestDto = new RegisterRssRequestDto({
      blog: 'blog1',
      name: 'name1',
      email: 'test1@test.com',
      rssUrl: 'https://test.com/rss',
    });

    // when
    const response = await agent.post(URL).send(requestDto);

    // then
    const { data } = response.body;
    expect(response.status).toBe(HttpStatus.CREATED);
    expect(data).toBeUndefined();
  });
});
