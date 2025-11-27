import { HttpStatus, INestApplication } from '@nestjs/common';
import {
  RssAcceptRepository,
  RssRepository,
} from '../../../src/rss/repository/rss.repository';
import { RssFixture } from '../../fixture/rss.fixture';
import * as supertest from 'supertest';
import { DeleteRssRequestDto } from '../../../src/rss/dto/request/deleteRss.dto';
import TestAgent from 'supertest/lib/agent';

const URL = '/api/rss/remove';

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

  it('[404] RSS가 없을 경우 RSS 삭제 신청을 실패한다.', async () => {
    // given
    const requestDto = new DeleteRssRequestDto({
      blogUrl: 'https://notfound.com',
      email: 'test@test.com',
    });

    // Http when
    const response = await agent.post(URL).send(requestDto);

    // Http then
    const { data } = response.body;
    expect(response.status).toBe(HttpStatus.NOT_FOUND);
    expect(data).toBeUndefined();
  });

  it('[200] RSS 등록 요청이 있을 경우 RSS 삭제 신청을 성공한다.', async () => {
    // given
    const rss = await rssRepository.save(RssFixture.createRssFixture());
    const requestDto = new DeleteRssRequestDto({
      blogUrl: rss.rssUrl,
      email: rss.email,
    });

    // Http when
    const response = await agent.post(URL).send(requestDto);

    // Http then
    const { data } = response.body;
    expect(response.status).toBe(HttpStatus.OK);
    expect(data).toBeUndefined();

    // cleanup
    await rssRepository.delete({ id: rss.id });
  });

  it('[200] 이미 등록된 RSS가 있을 경우 RSS 삭제 신청을 성공한다.', async () => {
    // given
    const rss = await rssAcceptRepository.save(RssFixture.createRssFixture());
    const requestDto = new DeleteRssRequestDto({
      blogUrl: rss.rssUrl,
      email: rss.email,
    });

    // Http when
    const response = await agent.post(URL).send(requestDto);

    // Http then
    const { data } = response.body;
    expect(response.status).toBe(HttpStatus.OK);
    expect(data).toBeUndefined();

    // cleanup
    await rssAcceptRepository.delete({ id: rss.id });
  });
});
