import { HttpStatus } from '@nestjs/common';
import { RssReject } from '../../../../src/rss/entity/rss.entity';
import { RssRejectFixture } from '../../../config/common/fixture/rss-reject.fixture';
import { RssE2EHelper } from '../../../config/common/helper/rss/rss-helper';

const URL = '/api/rss/history/reject';

describe(`GET ${URL} E2E Test`, () => {
  const { agent, rssRejectRepository, redisService, getAdminRedisKey } =
    new RssE2EHelper();
  let rssRejectList: RssReject[];
  const sessionKey = 'admin-rss-history-reject';

  beforeEach(async () => {
    const rssRejects = Array.from({ length: 2 }).map((_, i) =>
      RssRejectFixture.createRssRejectFixture(),
    );
    [rssRejectList] = await Promise.all([
      rssRejectRepository.save(rssRejects),
      redisService.set(getAdminRedisKey(sessionKey), 'test1234'),
    ]);
    rssRejectList.reverse();
  });

  afterEach(async () => {
    await Promise.all([
      rssRejectRepository.delete(
        rssRejectList.map((rssReject) => rssReject.id),
      ),
      redisService.del(getAdminRedisKey(sessionKey)),
    ]);
  });

  it('[401] 관리자 로그인 쿠키가 없을 경우 RSS 거절 기록 조회를 실패한다.', async () => {
    // Http when
    const response = await agent.get(URL);

    // Http then
    const { data } = response.body;
    expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
    expect(data).toBeUndefined();
  });

  it('[401] 관리자 로그인 쿠키가 만료됐을 경우 RSS 거절 기록 조회를 실패한다.', async () => {
    // Http when
    const response = await agent
      .get(URL)
      .set('Cookie', `sessionId=Wrong${sessionKey}`);

    // Http then
    const { data } = response.body;
    expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
    expect(data).toBeUndefined();
  });

  it('[200] 관리자 로그인이 되어 있을 경우 RSS 거절 기록 조회를 성공한다.', async () => {
    // Http when
    const response = await agent
      .get(URL)
      .set('Cookie', `sessionId=${sessionKey}`);

    // Http then
    const { data } = response.body;
    expect(response.status).toBe(HttpStatus.OK);
    expect(data).toStrictEqual(
      rssRejectList.map((rssReject) => ({
        description: rssReject.description,
        email: rssReject.email,
        id: rssReject.id,
        name: rssReject.name,
        rssUrl: rssReject.rssUrl,
        userName: rssReject.userName,
      })),
    );
  });
});
