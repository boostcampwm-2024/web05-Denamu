import { HttpStatus } from '@nestjs/common';
import { RssFixture } from '../../config/common/fixture/rss.fixture';
import { RssE2EHelper } from '../../config/common/helper/rss/rss-helper';

const URL = '/api/rss';

describe(`GET ${URL} E2E Test`, () => {
  const { agent, rssRepository, redisService, getAdminRedisKey } =
    new RssE2EHelper();
  const sessionKey = 'admin-rss-get';

  beforeEach(async () => {
    await redisService.set(getAdminRedisKey(sessionKey), 'test1234');
  });

  afterEach(async () => {
    await redisService.del(getAdminRedisKey(sessionKey));
  });

  it('[401] 관리자 로그인 쿠키가 없을 경우 RSS 조회를 실패한다.', async () => {
    // Http when
    const response = await agent.get(URL);

    // Http then
    const { data } = response.body;
    expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
    expect(data).toBeUndefined();
  });

  it('[401] 관리자 로그인 쿠키가 만료됐을 경우 RSS 조회를 실패한다.', async () => {
    // Http when
    const response = await agent
      .get(URL)
      .set('Cookie', `sessionId=Wrong${sessionKey}`);

    // Http then
    const { data } = response.body;
    expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
    expect(data).toBeUndefined();
  });

  it('[200] 신청된 RSS가 없을 경우 RSS 신청 조회를 성공한다.', async () => {
    // Http when
    const response = await agent
      .get(URL)
      .set('Cookie', `sessionId=${sessionKey}`);

    // Http then
    const { data } = response.body;
    expect(response.status).toBe(HttpStatus.OK);
    expect(data).toStrictEqual([]);
  });

  it('[200] 신청된 RSS가 있을 경우 RSS 신청 조회를 성공한다.', async () => {
    // given
    const rss = await rssRepository.save(RssFixture.createRssFixture());

    // Http when
    const response = await agent
      .get(URL)
      .set('Cookie', `sessionId=${sessionKey}`);

    // Http then
    const { data } = response.body;
    expect(response.status).toBe(HttpStatus.OK);
    expect(data).toStrictEqual([
      {
        id: rss.id,
        name: rss.name,
        userName: rss.userName,
        email: rss.email,
        rssUrl: rss.rssUrl,
      },
    ]);

    // cleanup
    await rssRepository.delete(rss.id);
  });
});
