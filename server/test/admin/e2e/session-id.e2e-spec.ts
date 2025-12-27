import { HttpStatus } from '@nestjs/common';
import { AdminE2EHelper } from '../../config/common/helper/admin/admin-helper';

const URL = '/api/admin/sessionId';

describe(`GET ${URL} E2E Test`, () => {
  const { agent, redisService, getRedisKey } = new AdminE2EHelper();
  const sessionKey = 'admin-session-check-key';

  beforeEach(async () => {
    await redisService.set(getRedisKey(sessionKey), 'testAdminId');
  });

  afterEach(async () => {
    await redisService.del(getRedisKey(sessionKey));
  });

  it('[401] 관리자 로그인 쿠키가 없을 경우 관리자 자동 로그인을 실패한다.', async () => {
    // Http when
    const response = await agent.get(URL);

    // Http then
    const { data } = response.body;
    expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
    expect(data).toBeUndefined();

    // DB, Redis when
    const savedSession = await redisService.get(getRedisKey(sessionKey));

    // DB, Redis then
    expect(savedSession).not.toBeNull();
  });

  it('[401] 관리자 로그인 쿠키가 만료됐을 경우 관리자 자동 로그인을 실패한다.', async () => {
    // Http when
    const response = await agent
      .get(URL)
      .set('Cookie', `sessionId=Wrong${sessionKey}`);

    // Http then
    const { data } = response.body;
    expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
    expect(data).toBeUndefined();

    // DB, Redis when
    const savedSession = await redisService.get(getRedisKey(sessionKey));

    // DB, Redis then
    expect(savedSession).not.toBeNull();
  });

  it('[200] 관리자 로그인 쿠키가 존재할 경우 관리자 자동 로그인을 성공한다.', async () => {
    // Http when
    const response = await agent
      .get(URL)
      .set('Cookie', `sessionId=${sessionKey}`);

    // Http then
    const { data } = response.body;
    expect(response.status).toBe(HttpStatus.OK);
    expect(data).toBeUndefined();

    // DB, Redis when
    const savedSession = await redisService.get(getRedisKey(sessionKey));

    // DB, Redis then
    expect(savedSession).not.toBeNull();
  });
});
