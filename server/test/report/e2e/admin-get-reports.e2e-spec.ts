import { HttpStatus } from '@nestjs/common';

import supertest from 'supertest';
import TestAgent from 'supertest/lib/agent';

import { AdminRepository } from '@admin/repository/admin.repository';

import { REDIS_KEYS } from '@common/redis/redis.constant';
import { RedisService } from '@common/redis/redis.service';

import { ReportReason, ReportStatus, ReportTargetType } from '@report/constant/report.constant';
import { ReportRepository } from '@report/repository/report.repository';

import { User } from '@user/entity/user.entity';
import { UserRepository } from '@user/repository/user.repository';

import { AdminFixture } from '@test/config/common/fixture/admin.fixture';
import { UserFixture } from '@test/config/common/fixture/user.fixture';
import { testApp } from '@test/config/e2e/env/jest.setup';

const BASE_URL = '/api/admins/reports';

describe(`GET ${BASE_URL} E2E Test`, () => {
  let agent: TestAgent;
  let redisService: RedisService;
  let adminRepository: AdminRepository;
  let reportRepository: ReportRepository;
  let userRepository: UserRepository;

  const sessionKey = 'admin-report-get-session-key';
  const redisKeyMake = (data: string) => `${REDIS_KEYS.ADMIN_AUTH_KEY}:${data}`;

  let reporter: User;
  let target: User;

  beforeAll(() => {
    agent = supertest(testApp.getHttpServer());
    redisService = testApp.get(RedisService);
    adminRepository = testApp.get(AdminRepository);
    reportRepository = testApp.get(ReportRepository);
    userRepository = testApp.get(UserRepository);
  });

  beforeEach(async () => {
    const admin = await adminRepository.save(await AdminFixture.createAdminCryptFixture());
    await redisService.set(redisKeyMake(sessionKey), admin.email);

    [reporter, target] = await Promise.all([
      userRepository.save(await UserFixture.createUserCryptFixture()),
      userRepository.save(await UserFixture.createUserCryptFixture()),
    ]);
  });

  it('[401] 관리자 세션 쿠키가 없으면 신고 목록 조회를 실패한다.', async () => {
    // Http when
    const response = await agent.get(BASE_URL);

    // Http then
    expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
  });

  it('[200] 신고 목록을 최신순으로 조회한다.', async () => {
    // given
    await reportRepository.insert({
      reporter: { id: reporter.id },
      targetType: ReportTargetType.USER,
      targetId: target.id,
      reportedUser: { id: target.id },
      reason: ReportReason.ABUSE,
    });

    // Http when
    const response = await agent.get(BASE_URL).set('Cookie', `sessionId=${sessionKey}`);

    // Http then
    expect(response.status).toBe(HttpStatus.OK);
    const { data } = response.body as { data: { result: unknown[] } };
    expect(data.result).toHaveLength(1);
    expect(data.result[0]).toMatchObject({
      targetType: ReportTargetType.USER,
      targetId: target.id,
      reason: ReportReason.ABUSE,
      status: ReportStatus.PENDING,
    });
  });

  it('[200] status 필터로 신고 목록을 조회한다.', async () => {
    // given
    await reportRepository.insert({
      reporter: { id: reporter.id },
      targetType: ReportTargetType.USER,
      targetId: target.id,
      reportedUser: { id: target.id },
      reason: ReportReason.ABUSE,
      status: ReportStatus.ACTIONED,
    });

    // Http when
    const response = await agent
      .get(BASE_URL)
      .query({ status: ReportStatus.PENDING })
      .set('Cookie', `sessionId=${sessionKey}`);

    // Http then
    expect(response.status).toBe(HttpStatus.OK);
    const { data } = response.body as { data: { result: unknown[] } };
    expect(data.result).toHaveLength(0);
  });
});
