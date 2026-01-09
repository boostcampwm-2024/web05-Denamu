import { HttpStatus } from '@nestjs/common';
import { RssRepository } from '@src/rss/repository/rss.repository';
import { RssFixture } from '@test/config/common/fixture/rss.fixture';
import supertest from 'supertest';
import { DeleteRssRequestDto } from '@src/rss/dto/request/deleteRss.dto';
import TestAgent from 'supertest/lib/agent';
import * as uuid from 'uuid';
import { RedisService } from '@src/common/redis/redis.service';
import { REDIS_KEYS } from '@src/common/redis/redis.constant';
import { Rss } from '@src/rss/entity/rss.entity';
import { testApp } from '@test/config/e2e/env/jest.setup';

const URL = '/api/rss/remove';

describe(`POST ${URL} E2E Test`, () => {
  let agent: TestAgent;
  let rssRepository: RssRepository;
  let redisService: RedisService;
  let rss: Rss;
  const rssDeleteCode = 'rss-remove-request';
  const redisKeyMake = (data: string) => `${REDIS_KEYS.RSS_REMOVE_KEY}:${data}`;

  beforeAll(() => {
    agent = supertest(testApp.getHttpServer());
    rssRepository = testApp.get(RssRepository);
    redisService = testApp.get(RedisService);
  });

  beforeEach(async () => {
    jest.spyOn(uuid, 'v4').mockReturnValue(rssDeleteCode as any);
    rss = await rssRepository.save(RssFixture.createRssFixture());
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
  });

  it('[200] 등록된 RSS가 있을 경우 RSS 삭제 신청을 성공한다.', async () => {
    // given
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
  });
});
