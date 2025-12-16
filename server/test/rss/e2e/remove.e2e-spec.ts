import { HttpStatus, INestApplication } from '@nestjs/common';
import {
  RssAcceptRepository,
  RssRepository,
} from '../../../src/rss/repository/rss.repository';
import { RssFixture } from '../../config/common/fixture/rss.fixture';
import * as supertest from 'supertest';
import { DeleteRssRequestDto } from '../../../src/rss/dto/request/deleteRss.dto';
import TestAgent from 'supertest/lib/agent';
import * as uuid from 'uuid';
import { RedisService } from '../../../src/common/redis/redis.service';
import { REDIS_KEYS } from '../../../src/common/redis/redis.constant';

const URL = '/api/rss/remove';

describe(`POST ${URL} E2E Test`, () => {
  let app: INestApplication;
  let agent: TestAgent;
  let rssRepository: RssRepository;
  let rssAcceptRepository: RssAcceptRepository;
  let redisService: RedisService;
  const rssDeleteCode = 'rss-remove-request';
  const redisKeyMake = (data: string) => `${REDIS_KEYS.RSS_REMOVE_KEY}:${data}`;

  beforeAll(() => {
    app = global.testApp;
    agent = supertest(app.getHttpServer());
    rssRepository = app.get(RssRepository);
    rssAcceptRepository = app.get(RssAcceptRepository);
    redisService = app.get(RedisService);
  });

  beforeEach(() => {
    jest.spyOn(uuid, 'v4').mockReturnValue(rssDeleteCode as any);
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

    // DB, Redis when
    const savedUUID = await redisService.get(redisKeyMake(rssDeleteCode));

    // DB, Redis then
    expect(savedUUID).toBeNull();
  });

  it('[200] RSS 대기 목록에 있을 경우 RSS 삭제 신청을 성공한다.', async () => {
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

    // DB, Redis when
    const savedUUID = await redisService.get(redisKeyMake(rssDeleteCode));

    // DB, Redis then
    expect(savedUUID).toBe(rss.rssUrl);

    // cleanup
    await rssRepository.delete({ id: rss.id });
    await redisService.del(redisKeyMake(rssDeleteCode));
  });

  it('[200] 등록된 RSS가 있을 경우 RSS 삭제 신청을 성공한다.', async () => {
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

    // DB, Redis when
    const savedUUID = await redisService.get(redisKeyMake(rssDeleteCode));

    // DB, Redis then
    expect(savedUUID).toBe(rss.rssUrl);

    // cleanup
    await rssRepository.delete({ id: rss.id });
    await redisService.del(redisKeyMake(rssDeleteCode));
  });
});
