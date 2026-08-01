import { HttpStatus } from '@nestjs/common';

import supertest from 'supertest';
import TestAgent from 'supertest/lib/agent';

import { Feed } from '@feed/entity/feed.entity';
import { FeedRepository } from '@feed/repository/feed.repository';

import { ReportReason, ReportTargetType } from '@report/constant/report.constant';
import { ReportRepository } from '@report/repository/report.repository';

import { RssAccept } from '@rss/entity/rss.entity';
import { RssAcceptRepository } from '@rss/repository/rss.repository';

import { User } from '@user/entity/user.entity';
import { UserRepository } from '@user/repository/user.repository';

import { FeedFixture } from '@test/config/common/fixture/feed.fixture';
import { RssAcceptFixture } from '@test/config/common/fixture/rss-accept.fixture';
import { UserFixture } from '@test/config/common/fixture/user.fixture';
import { createAccessToken, testApp } from '@test/config/e2e/env/jest.setup';

const BASE_URL = '/api/reports/feeds';

describe(`POST ${BASE_URL}/:feedId E2E Test`, () => {
  let agent: TestAgent;
  let reportRepository: ReportRepository;
  let feedRepository: FeedRepository;
  let rssAcceptRepository: RssAcceptRepository;
  let userRepository: UserRepository;
  let reporter: User;
  let targetFeed: Feed;
  let accessToken: string;

  beforeAll(() => {
    agent = supertest(testApp.getHttpServer());
    reportRepository = testApp.get(ReportRepository);
    feedRepository = testApp.get(FeedRepository);
    rssAcceptRepository = testApp.get(RssAcceptRepository);
    userRepository = testApp.get(UserRepository);
  });

  beforeEach(async () => {
    reporter = await userRepository.save(await UserFixture.createUserCryptFixture());
    const rssAccept: RssAccept = await rssAcceptRepository.save(RssAcceptFixture.createRssAcceptFixture());
    targetFeed = await feedRepository.save(FeedFixture.createFeedFixture(rssAccept));
    accessToken = createAccessToken(reporter);
  });

  it('[404] 신고 대상 게시글이 존재하지 않을 경우 실패한다.', async () => {
    // Http when
    const response = await agent
      .post(`${BASE_URL}/${Number.MAX_SAFE_INTEGER}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ reason: ReportReason.SPAM });

    // Http then
    expect(response.status).toBe(HttpStatus.NOT_FOUND);
  });

  it('[400] 자신의 게시글을 신고할 경우 실패한다.', async () => {
    // given
    const ownedRss = await rssAcceptRepository.save(
      RssAcceptFixture.createRssAcceptFixture({ userId: reporter.id }),
    );
    const ownFeed = await feedRepository.save(FeedFixture.createFeedFixture(ownedRss));

    // Http when
    const response = await agent
      .post(`${BASE_URL}/${ownFeed.id}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ reason: ReportReason.SPAM });

    // Http then
    expect(response.status).toBe(HttpStatus.BAD_REQUEST);
  });

  it('[201] 게시글 신고 등록을 성공한다.', async () => {
    // Http when
    const response = await agent
      .post(`${BASE_URL}/${targetFeed.id}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ reason: ReportReason.ADULT });

    // Http then
    expect(response.status).toBe(HttpStatus.CREATED);

    // DB when
    const saved = await reportRepository.findOneBy({
      reporter: { id: reporter.id },
      targetType: ReportTargetType.FEED,
      targetId: targetFeed.id,
    });

    // DB then
    expect(saved).not.toBeNull();
    expect(saved.reason).toBe(ReportReason.ADULT);
  });
});
