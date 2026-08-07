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

const URL = (id: number | string) => `/api/admins/marketing-emails/${id}`;

describe(`GET /api/admins/marketing-emails/:id E2E Test`, () => {
  let agent: TestAgent;
  let redisService: RedisService;
  let adminRepository: AdminRepository;
  let marketingEmailRepository: MarketingEmailRepository;

  const sessionKey = 'admin-marketing-email-detail-session-key';
  const redisKeyMake = (data: string) => `${REDIS_KEYS.ADMIN_AUTH_KEY}:${data}`;

  let admin: Admin;
  let marketingEmail: MarketingEmail;

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

    marketingEmail = await marketingEmailRepository.save(
      MarketingEmailFixture.createMarketingEmailFixture({
        author: admin,
        recipientCount: 5,
      }),
    );
  });

  it('[401] 관리자 세션 쿠키가 없을 경우 상세 조회를 실패한다.', async () => {
    // Http when
    const response = await agent.get(URL(marketingEmail.id));

    // Http then
    const { data } = response.body;
    expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
    expect(data).toBeUndefined();
  });

  it('[200] 발송 이력의 본문을 포함하여 상세 조회를 성공한다.', async () => {
    // Http when
    const response = await agent
      .get(URL(marketingEmail.id))
      .set('Cookie', `sessionId=${sessionKey}`);

    // Http then
    const { message, data } = response.body;
    expect(response.status).toBe(HttpStatus.OK);
    expect(message).toBe('발송 상세 조회를 성공했습니다.');
    expect(data).toMatchObject({
      id: marketingEmail.id,
      subject: marketingEmail.subject,
      content: marketingEmail.content,
      recipientCount: 5,
      authorName: admin.name,
    });
  });

  it('[404] 존재하지 않는 발송 이력일 경우 상세 조회를 실패한다.', async () => {
    // Http when
    const response = await agent
      .get(URL(999999))
      .set('Cookie', `sessionId=${sessionKey}`);

    // Http then
    expect(response.status).toBe(HttpStatus.NOT_FOUND);
  });

  it('[400] id가 정수가 아닐 경우 상세 조회를 실패한다.', async () => {
    // Http when
    const response = await agent
      .get(URL('abc'))
      .set('Cookie', `sessionId=${sessionKey}`);

    // Http then
    expect(response.status).toBe(HttpStatus.BAD_REQUEST);
  });
});
