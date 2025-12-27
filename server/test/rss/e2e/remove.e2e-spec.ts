import { HttpStatus } from '@nestjs/common';
import { RssFixture } from '../../config/common/fixture/rss.fixture';
import { DeleteRssRequestDto } from '../../../src/rss/dto/request/deleteRss.dto';
import * as uuid from 'uuid';
import { Rss } from '../../../src/rss/entity/rss.entity';
import { RssE2EHelper } from '../../config/common/helper/rss/rss-helper';

const URL = '/api/rss/remove';

describe(`POST ${URL} E2E Test`, () => {
  const { agent, rssRepository, redisService, getRssRemoveRedisKey } =
    new RssE2EHelper();
  let rss: Rss;
  const rssDeleteCode = 'rss-remove-request';

  beforeEach(async () => {
    jest.spyOn(uuid, 'v4').mockReturnValue(rssDeleteCode as any);
    rss = await rssRepository.save(RssFixture.createRssFixture());
  });

  afterEach(async () => {
    await Promise.all([
      rssRepository.delete(rss.id),
      redisService.del(getRssRemoveRedisKey(rssDeleteCode)),
    ]);
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
    const savedUUID = await redisService.get(
      getRssRemoveRedisKey(rssDeleteCode),
    );

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
    const savedUUID = await redisService.get(
      getRssRemoveRedisKey(rssDeleteCode),
    );

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
    const savedUUID = await redisService.get(
      getRssRemoveRedisKey(rssDeleteCode),
    );

    // DB, Redis then
    expect(savedUUID).toBe(rss.rssUrl);
  });
});
