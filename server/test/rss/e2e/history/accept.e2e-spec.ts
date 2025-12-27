import { HttpStatus } from '@nestjs/common';
import { RssAccept } from '../../../../src/rss/entity/rss.entity';
import { RssAcceptFixture } from '../../../config/common/fixture/rss-accept.fixture';
import { RssE2EHelper } from '../../../config/common/helper/rss/rss-helper';

const URL = '/api/rss/history/accept';

describe(`GET ${URL} E2E Test`, () => {
  const { agent, rssAcceptRepository, redisService, getAdminRedisKey } =
    new RssE2EHelper();
  let rssAcceptList: RssAccept[];
  const sessionKey = 'admin-rss-history-accept';

  beforeEach(async () => {
    const rssAccepts = Array.from({ length: 2 }).map((_, i) =>
      RssAcceptFixture.createRssAcceptFixture(),
    );
    [rssAcceptList] = await Promise.all([
      rssAcceptRepository.save(rssAccepts),
      redisService.set(getAdminRedisKey(sessionKey), 'test1234'),
    ]);
    rssAcceptList.reverse();
  });

  afterEach(async () => {
    await Promise.all([
      rssAcceptRepository.delete(
        rssAcceptList.map((rssAccept) => rssAccept.id),
      ),
      redisService.del(getAdminRedisKey(sessionKey)),
    ]);
  });

  it('[401] 관리자 로그인 쿠키가 없을 경우 RSS 승인 기록 조회를 실패한다.', async () => {
    // Http when
    const response = await agent.get(URL);

    // Http then
    const { data } = response.body;
    expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
    expect(data).toBeUndefined();
  });

  it('[401] 관리자 로그인 쿠키가 만료됐을 경우 RSS 승인 기록 조회를 실패한다.', async () => {
    // Http when
    const response = await agent
      .get(URL)
      .set('Cookie', `sessionId=Wrong${sessionKey}`);

    // Http then
    const { data } = response.body;
    expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
    expect(data).toBeUndefined();
  });

  it('[200] 관리자 로그인이 되어있을 경우 RSS 승인 기록 조회를 성공한다.', async () => {
    // Http when
    const response = await agent
      .get(URL)
      .set('Cookie', `sessionId=${sessionKey}`);

    // Http then
    const { data } = response.body;
    expect(response.status).toBe(HttpStatus.OK);
    expect(data).toStrictEqual(
      rssAcceptList.map((rssAccept) => ({
        blogPlatform: rssAccept.blogPlatform,
        email: rssAccept.email,
        id: rssAccept.id,
        name: rssAccept.name,
        rssUrl: rssAccept.rssUrl,
        userName: rssAccept.userName,
      })),
    );
  });
});
