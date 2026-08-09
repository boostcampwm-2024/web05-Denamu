import { HttpStatus } from '@nestjs/common';

import supertest from 'supertest';
import TestAgent from 'supertest/lib/agent';

import { AdminRepository } from '@admin/repository/admin.repository';

import { REDIS_KEYS } from '@common/redis/redis.constant';
import { RedisService } from '@common/redis/redis.service';

import {
  ReportReason,
  ReportTargetType,
} from '@report/constant/report.constant';
import { ReportRepository } from '@report/repository/report.repository';

import { User } from '@user/entity/user.entity';
import { UserRepository } from '@user/repository/user.repository';

import { AdminFixture } from '@test/config/common/fixture/admin.fixture';
import { UserFixture } from '@test/config/common/fixture/user.fixture';
import { testApp } from '@test/config/e2e/env/jest.setup';

const URL = (reportId: number) => `/api/admins/reports/${reportId}`;

describe('DELETE /api/admins/reports/{reportId} E2E Test', () => {
  let agent: TestAgent;
  let redisService: RedisService;
  let adminRepository: AdminRepository;
  let reportRepository: ReportRepository;
  let userRepository: UserRepository;

  const sessionKey = 'admin-report-reject-session-key';
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
    const admin = await adminRepository.save(
      await AdminFixture.createAdminCryptFixture(),
    );
    await redisService.set(redisKeyMake(sessionKey), admin.email);

    [reporter, target] = await Promise.all([
      userRepository.save(await UserFixture.createUserCryptFixture()),
      userRepository.save(await UserFixture.createUserCryptFixture()),
    ]);
  });

  it('[401] 관리자 세션 쿠키가 없으면 신고 거절을 실패한다.', async () => {
    // Http when
    const response = await agent.delete(URL(1));

    // Http then
    expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
  });

  it('[404] 존재하지 않는 신고를 거절할 경우 실패한다.', async () => {
    // Http when
    const response = await agent
      .delete(URL(Number.MAX_SAFE_INTEGER))
      .set('Cookie', `sessionId=${sessionKey}`);

    // Http then
    expect(response.status).toBe(HttpStatus.NOT_FOUND);
  });

  it('[200] 신고를 거절하면 신고 데이터가 즉시 삭제된다.', async () => {
    // given
    const report = await reportRepository.save({
      reporter: { id: reporter.id },
      targetType: ReportTargetType.USER,
      targetId: target.id,
      reportedUser: { id: target.id },
      reason: ReportReason.ABUSE,
    });

    // Http when
    const response = await agent
      .delete(URL(report.id))
      .set('Cookie', `sessionId=${sessionKey}`);

    // Http then
    expect(response.status).toBe(HttpStatus.OK);

    // DB when
    const savedReport = await reportRepository.findOneBy({ id: report.id });

    // DB then
    expect(savedReport).toBeNull();
  });
});
