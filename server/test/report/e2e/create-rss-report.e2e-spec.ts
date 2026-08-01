import { HttpStatus } from '@nestjs/common';

import supertest from 'supertest';
import TestAgent from 'supertest/lib/agent';

import { ReportReason, ReportTargetType } from '@report/constant/report.constant';
import { ReportRepository } from '@report/repository/report.repository';

import { RssAccept } from '@rss/entity/rss.entity';
import { RssAcceptRepository } from '@rss/repository/rss.repository';

import { User } from '@user/entity/user.entity';
import { UserRepository } from '@user/repository/user.repository';

import { RssAcceptFixture } from '@test/config/common/fixture/rss-accept.fixture';
import { UserFixture } from '@test/config/common/fixture/user.fixture';
import { createAccessToken, testApp } from '@test/config/e2e/env/jest.setup';

const BASE_URL = '/api/reports/rss';

describe(`POST ${BASE_URL}/:rssId E2E Test`, () => {
  let agent: TestAgent;
  let reportRepository: ReportRepository;
  let rssAcceptRepository: RssAcceptRepository;
  let userRepository: UserRepository;
  let reporter: User;
  let targetRss: RssAccept;
  let accessToken: string;

  beforeAll(() => {
    agent = supertest(testApp.getHttpServer());
    reportRepository = testApp.get(ReportRepository);
    rssAcceptRepository = testApp.get(RssAcceptRepository);
    userRepository = testApp.get(UserRepository);
  });

  beforeEach(async () => {
    reporter = await userRepository.save(await UserFixture.createUserCryptFixture());
    targetRss = await rssAcceptRepository.save(RssAcceptFixture.createRssAcceptFixture());
    accessToken = createAccessToken(reporter);
  });

  it('[404] 신고 대상 RSS가 존재하지 않을 경우 실패한다.', async () => {
    // Http when
    const response = await agent
      .post(`${BASE_URL}/${Number.MAX_SAFE_INTEGER}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ reason: ReportReason.SPAM });

    // Http then
    expect(response.status).toBe(HttpStatus.NOT_FOUND);
  });

  it('[400] 본인 소유의 RSS를 신고할 경우 실패한다.', async () => {
    // given
    const ownedRss = await rssAcceptRepository.save(
      RssAcceptFixture.createRssAcceptFixture({ userId: reporter.id }),
    );

    // Http when
    const response = await agent
      .post(`${BASE_URL}/${ownedRss.id}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ reason: ReportReason.SPAM });

    // Http then
    expect(response.status).toBe(HttpStatus.BAD_REQUEST);
  });

  it('[201] RSS 신고 등록을 성공한다.', async () => {
    // Http when
    const response = await agent
      .post(`${BASE_URL}/${targetRss.id}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ reason: ReportReason.COPYRIGHT });

    // Http then
    expect(response.status).toBe(HttpStatus.CREATED);

    // DB when
    const saved = await reportRepository.findOneBy({
      reporter: { id: reporter.id },
      targetType: ReportTargetType.RSS,
      targetId: targetRss.id,
    });

    // DB then
    expect(saved).not.toBeNull();
    expect(saved.reason).toBe(ReportReason.COPYRIGHT);
  });
});
