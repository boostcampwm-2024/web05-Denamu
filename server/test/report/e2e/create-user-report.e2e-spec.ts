import { HttpStatus } from '@nestjs/common';

import supertest from 'supertest';
import TestAgent from 'supertest/lib/agent';

import { ReportReason, ReportStatus, ReportTargetType } from '@report/constant/report.constant';
import { ReportRepository } from '@report/repository/report.repository';

import { User } from '@user/entity/user.entity';
import { UserRepository } from '@user/repository/user.repository';

import { UserFixture } from '@test/config/common/fixture/user.fixture';
import { createAccessToken, testApp } from '@test/config/e2e/env/jest.setup';

const BASE_URL = '/api/reports/users';

describe(`POST ${BASE_URL}/:userId E2E Test`, () => {
  let agent: TestAgent;
  let reportRepository: ReportRepository;
  let userRepository: UserRepository;
  let reporter: User;
  let target: User;
  let accessToken: string;

  beforeAll(() => {
    agent = supertest(testApp.getHttpServer());
    reportRepository = testApp.get(ReportRepository);
    userRepository = testApp.get(UserRepository);
  });

  beforeEach(async () => {
    [reporter, target] = await Promise.all([
      userRepository.save(await UserFixture.createUserCryptFixture()),
      userRepository.save(await UserFixture.createUserCryptFixture()),
    ]);
    accessToken = createAccessToken(reporter);
  });

  it('[401] 로그인이 되어 있지 않을 경우 사용자 신고를 실패한다.', async () => {
    // Http when
    const response = await agent.post(`${BASE_URL}/${target.id}`).send({ reason: ReportReason.SPAM });

    // Http then
    expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
  });

  it('[400] 자기 자신을 신고할 경우 실패한다.', async () => {
    // Http when
    const response = await agent
      .post(`${BASE_URL}/${reporter.id}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ reason: ReportReason.SPAM });

    // Http then
    expect(response.status).toBe(HttpStatus.BAD_REQUEST);
  });

  it('[404] 신고 대상 사용자가 존재하지 않을 경우 실패한다.', async () => {
    // Http when
    const response = await agent
      .post(`${BASE_URL}/${Number.MAX_SAFE_INTEGER}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ reason: ReportReason.SPAM });

    // Http then
    expect(response.status).toBe(HttpStatus.NOT_FOUND);
  });

  it('[409] 이미 신고한 사용자를 다시 신고할 경우 실패한다.', async () => {
    // given
    await reportRepository.insert({
      reporter: { id: reporter.id },
      targetType: ReportTargetType.USER,
      targetId: target.id,
      reportedUser: { id: target.id },
      reason: ReportReason.SPAM,
    });

    // Http when
    const response = await agent
      .post(`${BASE_URL}/${target.id}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ reason: ReportReason.SPAM });

    // Http then
    expect(response.status).toBe(HttpStatus.CONFLICT);
  });

  it('[201] 사용자 신고 등록을 성공한다.', async () => {
    // Http when
    const response = await agent
      .post(`${BASE_URL}/${target.id}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ reason: ReportReason.ABUSE, detail: '욕설을 사용했습니다.' });

    // Http then
    expect(response.status).toBe(HttpStatus.CREATED);

    // DB when
    const saved = await reportRepository.findOneBy({
      reporter: { id: reporter.id },
      targetType: ReportTargetType.USER,
      targetId: target.id,
    });

    // DB then
    expect(saved).not.toBeNull();
    expect(saved.reason).toBe(ReportReason.ABUSE);
    expect(saved.detail).toBe('욕설을 사용했습니다.');
    expect(saved.status).toBe(ReportStatus.PENDING);
  });
});
