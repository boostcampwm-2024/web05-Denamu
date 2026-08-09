import { HttpStatus } from '@nestjs/common';

import supertest from 'supertest';
import TestAgent from 'supertest/lib/agent';

import { AdminRepository } from '@admin/repository/admin.repository';

import { Comment } from '@comment/entity/comment.entity';
import { CommentRepository } from '@comment/repository/comment.repository';

import { REDIS_KEYS } from '@common/redis/redis.constant';
import { RedisService } from '@common/redis/redis.service';

import { Feed } from '@feed/entity/feed.entity';
import { FeedRepository } from '@feed/repository/feed.repository';

import {
  ReportReason,
  ReportTargetType,
} from '@report/constant/report.constant';
import { ReportRepository } from '@report/repository/report.repository';

import { RssAccept } from '@rss/entity/rss.entity';
import { RssAcceptRepository } from '@rss/repository/rss.repository';

import { RssSuspensionRepository } from '@suspension/repository/rssSuspension.repository';
import { UserSuspensionRepository } from '@suspension/repository/userSuspension.repository';

import { User } from '@user/entity/user.entity';
import { UserRepository } from '@user/repository/user.repository';

import { AdminFixture } from '@test/config/common/fixture/admin.fixture';
import { CommentFixture } from '@test/config/common/fixture/comment.fixture';
import { FeedFixture } from '@test/config/common/fixture/feed.fixture';
import { RssAcceptFixture } from '@test/config/common/fixture/rss-accept.fixture';
import { UserFixture } from '@test/config/common/fixture/user.fixture';
import { testApp } from '@test/config/e2e/env/jest.setup';

const URL = (reportId: number) => `/api/admins/reports/${reportId}/suspensions`;

describe('POST /api/admins/reports/{reportId}/suspensions E2E Test', () => {
  let agent: TestAgent;
  let redisService: RedisService;
  let adminRepository: AdminRepository;
  let reportRepository: ReportRepository;
  let userRepository: UserRepository;
  let rssAcceptRepository: RssAcceptRepository;
  let feedRepository: FeedRepository;
  let commentRepository: CommentRepository;
  let userSuspensionRepository: UserSuspensionRepository;
  let rssSuspensionRepository: RssSuspensionRepository;

  const sessionKey = 'admin-report-approve-session-key';
  const redisKeyMake = (data: string) => `${REDIS_KEYS.ADMIN_AUTH_KEY}:${data}`;
  let adminId: number;

  let reporter: User;
  let target: User;

  beforeAll(() => {
    agent = supertest(testApp.getHttpServer());
    redisService = testApp.get(RedisService);
    adminRepository = testApp.get(AdminRepository);
    reportRepository = testApp.get(ReportRepository);
    userRepository = testApp.get(UserRepository);
    rssAcceptRepository = testApp.get(RssAcceptRepository);
    feedRepository = testApp.get(FeedRepository);
    commentRepository = testApp.get(CommentRepository);
    userSuspensionRepository = testApp.get(UserSuspensionRepository);
    rssSuspensionRepository = testApp.get(RssSuspensionRepository);
  });

  beforeEach(async () => {
    const admin = await adminRepository.save(
      await AdminFixture.createAdminCryptFixture(),
    );
    adminId = admin.id;
    await redisService.set(redisKeyMake(sessionKey), admin.email);

    [reporter, target] = await Promise.all([
      userRepository.save(await UserFixture.createUserCryptFixture()),
      userRepository.save(await UserFixture.createUserCryptFixture()),
    ]);
  });

  it('[401] 관리자 세션 쿠키가 없으면 신고 승인을 실패한다.', async () => {
    // Http when
    const response = await agent.post(URL(1)).send({ detail: '정지 처리' });

    // Http then
    expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
  });

  it('[404] 존재하지 않는 신고를 승인할 경우 실패한다.', async () => {
    // Http when
    const response = await agent
      .post(URL(Number.MAX_SAFE_INTEGER))
      .set('Cookie', `sessionId=${sessionKey}`)
      .send({ detail: '정지 처리' });

    // Http then
    expect(response.status).toBe(HttpStatus.NOT_FOUND);
  });

  it('[400] 상세 내역 없이 승인할 경우 실패한다.', async () => {
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
      .post(URL(report.id))
      .set('Cookie', `sessionId=${sessionKey}`)
      .send({});

    // Http then
    expect(response.status).toBe(HttpStatus.BAD_REQUEST);
  });

  it('[400] 정지 종료 일시가 과거인 경우 실패한다.', async () => {
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
      .post(URL(report.id))
      .set('Cookie', `sessionId=${sessionKey}`)
      .send({
        detail: '정지 처리',
        suspendedUntil: new Date(Date.now() - 60 * 1000).toISOString(),
      });

    // Http then
    expect(response.status).toBe(HttpStatus.BAD_REQUEST);
  });

  it('[201] USER 신고를 승인하면 유저 정지가 생성되고 신고가 조치완료된다.', async () => {
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
      .post(URL(report.id))
      .set('Cookie', `sessionId=${sessionKey}`)
      .send({ detail: '반복적인 욕설로 인한 정지' });

    // Http then
    expect(response.status).toBe(HttpStatus.CREATED);

    // DB when
    const [savedReport, savedSuspension] = await Promise.all([
      reportRepository.findOneBy({ id: report.id }),
      userSuspensionRepository.findOne({
        where: { user: { id: target.id } },
        relations: ['admin'],
      }),
    ]);

    // DB then
    expect(savedReport).toBeNull();
    expect(savedSuspension).not.toBeNull();
    expect(savedSuspension.detail).toBe('반복적인 욕설로 인한 정지');
    expect(savedSuspension.suspendedUntil).toBeNull();
    expect(savedSuspension.admin?.id).toBe(adminId);
  });

  it('[201] COMMENT 신고를 승인하면 댓글 작성자가 유저 정지된다.', async () => {
    // given
    const rssAccept: RssAccept = await rssAcceptRepository.save(
      RssAcceptFixture.createRssAcceptFixture(),
    );
    const feed: Feed = await feedRepository.save(
      FeedFixture.createFeedFixture(rssAccept),
    );
    const comment: Comment = await commentRepository.save(
      CommentFixture.createCommentFixture(feed, target),
    );
    const report = await reportRepository.save({
      reporter: { id: reporter.id },
      targetType: ReportTargetType.COMMENT,
      targetId: comment.id,
      reportedComment: { id: comment.id },
      reason: ReportReason.SPAM,
    });
    const suspendedUntil = new Date(
      Date.now() + 7 * 24 * 60 * 60 * 1000,
    ).toISOString();

    // Http when
    const response = await agent
      .post(URL(report.id))
      .set('Cookie', `sessionId=${sessionKey}`)
      .send({ detail: '스팸 댓글 반복', suspendedUntil });

    // Http then
    expect(response.status).toBe(HttpStatus.CREATED);

    // DB when
    const savedSuspension = await userSuspensionRepository.findOneBy({
      user: { id: target.id },
    });

    // DB then
    expect(savedSuspension).not.toBeNull();
    // datetime 컬럼은 초 단위까지만 저장되므로 밀리초 오차를 허용한다.
    expect(
      Math.abs(
        savedSuspension.suspendedUntil.getTime() -
          new Date(suspendedUntil).getTime(),
      ),
    ).toBeLessThan(1000);
  });

  it('[201] RSS 신고를 승인하면 RSS가 정지된다.', async () => {
    // given
    const rssAccept: RssAccept = await rssAcceptRepository.save(
      RssAcceptFixture.createRssAcceptFixture({ userId: target.id }),
    );
    const report = await reportRepository.save({
      reporter: { id: reporter.id },
      targetType: ReportTargetType.RSS,
      targetId: rssAccept.id,
      reportedRss: { id: rssAccept.id },
      reason: ReportReason.COPYRIGHT,
    });

    // Http when
    const response = await agent
      .post(URL(report.id))
      .set('Cookie', `sessionId=${sessionKey}`)
      .send({ detail: '저작권 침해로 인한 RSS 정지' });

    // Http then
    expect(response.status).toBe(HttpStatus.CREATED);

    // DB when
    const savedSuspension = await rssSuspensionRepository.findOneBy({
      rss: { id: rssAccept.id },
    });

    // DB then
    expect(savedSuspension).not.toBeNull();
    expect(savedSuspension.detail).toBe('저작권 침해로 인한 RSS 정지');
  });

  it('[201] FEED 신고를 승인하면 게시글이 속한 RSS가 정지된다.', async () => {
    // given
    const rssAccept: RssAccept = await rssAcceptRepository.save(
      RssAcceptFixture.createRssAcceptFixture({ userId: target.id }),
    );
    const feed: Feed = await feedRepository.save(
      FeedFixture.createFeedFixture(rssAccept),
    );
    const report = await reportRepository.save({
      reporter: { id: reporter.id },
      targetType: ReportTargetType.FEED,
      targetId: feed.id,
      reportedFeed: { id: feed.id },
      reason: ReportReason.ADULT,
    });

    // Http when
    const response = await agent
      .post(URL(report.id))
      .set('Cookie', `sessionId=${sessionKey}`)
      .send({ detail: '음란물 게시로 인한 RSS 정지' });

    // Http then
    expect(response.status).toBe(HttpStatus.CREATED);

    // DB when
    const savedSuspension = await rssSuspensionRepository.findOneBy({
      rss: { id: rssAccept.id },
    });

    // DB then
    expect(savedSuspension).not.toBeNull();
  });
});
