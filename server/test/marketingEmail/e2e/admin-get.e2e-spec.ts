import { HttpStatus } from '@nestjs/common';

import supertest from 'supertest';
import TestAgent from 'supertest/lib/agent';

import { Admin } from '@admin/entity/admin.entity';
import { AdminRepository } from '@admin/repository/admin.repository';

import { REDIS_KEYS } from '@common/redis/redis.constant';
import { RedisService } from '@common/redis/redis.service';

import { MarketingEmail } from '@marketingEmail/entity/marketingEmail.entity';
import { MarketingEmailRepository } from '@marketingEmail/repository/marketingEmail.repository';

import { AdminFixture } from '@test/config/common/fixture/admin.fixture';
import { MarketingEmailFixture } from '@test/config/common/fixture/marketingEmail.fixture';
import { testApp } from '@test/config/e2e/env/jest.setup';

const URL = '/api/admins/marketing-emails';

type MarketingEmailListResponseBody = {
  message: string;
  data: {
    page: number;
    limit: number;
    totalCount: number;
    hasMore: boolean;
    result: { id: number; authorName: string | null }[];
  };
};

describe(`GET ${URL} E2E Test`, () => {
  let agent: TestAgent;
  let redisService: RedisService;
  let adminRepository: AdminRepository;
  let marketingEmailRepository: MarketingEmailRepository;

  const sessionKey = 'admin-marketing-email-get-session-key';
  const redisKeyMake = (data: string) => `${REDIS_KEYS.ADMIN_AUTH_KEY}:${data}`;

  let admin: Admin;
  let first: MarketingEmail;
  let second: MarketingEmail;
  let orphan: MarketingEmail;

  beforeAll(() => {
    agent = supertest(testApp.getHttpServer());
    redisService = testApp.get(RedisService);
    adminRepository = testApp.get(AdminRepository);
    marketingEmailRepository = testApp.get(MarketingEmailRepository);
  });

  beforeEach(async () => {
    admin = await adminRepository.save(
      await AdminFixture.createAdminCryptFixture(),
    );
    await redisService.set(redisKeyMake(sessionKey), admin.email);

    first = await marketingEmailRepository.save(
      MarketingEmailFixture.createMarketingEmailFixture({
        author: admin,
        recipientCount: 3,
      }),
    );
    second = await marketingEmailRepository.save(
      MarketingEmailFixture.createMarketingEmailFixture({ author: admin }),
    );
    orphan = await marketingEmailRepository.save(
      MarketingEmailFixture.createMarketingEmailFixture({ author: null }),
    );
  });

  it('[401] 관리자 세션 쿠키가 없을 경우 이력 조회를 실패한다.', async () => {
    // Http when
    const response = await agent.get(URL);

    // Http then
    const { data } = response.body;
    expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
    expect(data).toBeUndefined();
  });

  it('[200] 쿼리 파라미터가 없을 경우 기본 페이지네이션으로 이력 조회를 성공한다.', async () => {
    // Http when
    const response = await agent
      .get(URL)
      .set('Cookie', `sessionId=${sessionKey}`);

    // Http then
    const { message, data } = response.body as MarketingEmailListResponseBody;
    expect(response.status).toBe(HttpStatus.OK);
    expect(message).toBe('발송 이력 조회를 성공했습니다.');
    expect(data.page).toBe(1);
    expect(data.limit).toBe(10);
    expect(data.totalCount).toBe(3);
    expect(data.hasMore).toBe(false);
    expect(data.result.map((item) => item.id).sort()).toStrictEqual(
      [first.id, second.id, orphan.id].sort(),
    );
  });

  it('[200] 최신 발송 이력이 목록 최상단으로 정렬되어 조회를 성공한다.', async () => {
    // Http when
    const response = await agent
      .get(URL)
      .set('Cookie', `sessionId=${sessionKey}`);

    // Http then
    const { data } = response.body as MarketingEmailListResponseBody;
    expect(response.status).toBe(HttpStatus.OK);
    expect(data.result.map((item) => item.id)).toStrictEqual([
      orphan.id,
      second.id,
      first.id,
    ]);
  });

  it('[200] 발송한 관리자 이름과 수신자 수를 포함하여 조회를 성공한다.', async () => {
    // Http when
    const response = await agent
      .get(URL)
      .set('Cookie', `sessionId=${sessionKey}`);

    // Http then
    const { data } = response.body as MarketingEmailListResponseBody;
    expect(response.status).toBe(HttpStatus.OK);
    expect(data.result[2]).toMatchObject({
      id: first.id,
      subject: first.subject,
      recipientCount: 3,
      authorName: admin.name,
    });
    expect(data.result[2]).not.toHaveProperty('content');
  });

  it('[200] 발송한 관리자가 없는 이력일 경우 관리자 이름을 null로 조회를 성공한다.', async () => {
    // Http when
    const response = await agent
      .get(URL)
      .set('Cookie', `sessionId=${sessionKey}`);

    // Http then
    const { data } = response.body as MarketingEmailListResponseBody;
    expect(response.status).toBe(HttpStatus.OK);
    expect(data.result[0].authorName).toBeNull();
  });

  it('[200] 페이지네이션을 입력할 경우 해당 페이지 조회를 성공한다.', async () => {
    // Http when
    const response = await agent
      .get(URL)
      .query({ page: 1, limit: 2 })
      .set('Cookie', `sessionId=${sessionKey}`);

    // Http then
    const { data } = response.body as MarketingEmailListResponseBody;
    expect(response.status).toBe(HttpStatus.OK);
    expect(data.result).toHaveLength(2);
    expect(data.totalCount).toBe(3);
    expect(data.hasMore).toBe(true);
  });

  it('[400] page가 1 미만일 경우 이력 조회를 실패한다.', async () => {
    // Http when
    const response = await agent
      .get(URL)
      .query({ page: 0 })
      .set('Cookie', `sessionId=${sessionKey}`);

    // Http then
    expect(response.status).toBe(HttpStatus.BAD_REQUEST);
  });

  it('[400] limit이 정수가 아닐 경우 이력 조회를 실패한다.', async () => {
    // Http when
    const response = await agent
      .get(URL)
      .query({ limit: 'test' })
      .set('Cookie', `sessionId=${sessionKey}`);

    // Http then
    expect(response.status).toBe(HttpStatus.BAD_REQUEST);
  });
});
