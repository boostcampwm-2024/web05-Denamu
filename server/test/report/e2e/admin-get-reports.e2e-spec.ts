import { HttpStatus } from '@nestjs/common';

import supertest from 'supertest';
import TestAgent from 'supertest/lib/agent';

import { AdminRepository } from '@admin/repository/admin.repository';

import { CommentRepository } from '@comment/repository/comment.repository';

import { REDIS_KEYS } from '@common/redis/redis.constant';
import { RedisService } from '@common/redis/redis.service';

import { FeedRepository } from '@feed/repository/feed.repository';

import {
  ReportReason,
  ReportTargetType,
} from '@report/constant/report.constant';
import { ReportRepository } from '@report/repository/report.repository';

import { RssAcceptRepository } from '@rss/repository/rss.repository';

import { User } from '@user/entity/user.entity';
import { UserRepository } from '@user/repository/user.repository';

import { AdminFixture } from '@test/config/common/fixture/admin.fixture';
import {
  COMMENT_DEFAULT_TEXT,
  CommentFixture,
} from '@test/config/common/fixture/comment.fixture';
import { FeedFixture } from '@test/config/common/fixture/feed.fixture';
import { RssAcceptFixture } from '@test/config/common/fixture/rss-accept.fixture';
import { UserFixture } from '@test/config/common/fixture/user.fixture';
import { testApp } from '@test/config/e2e/env/jest.setup';

const BASE_URL = '/api/admins/reports';

describe(`GET ${BASE_URL} E2E Test`, () => {
  let agent: TestAgent;
  let redisService: RedisService;
  let adminRepository: AdminRepository;
  let reportRepository: ReportRepository;
  let userRepository: UserRepository;
  let rssAcceptRepository: RssAcceptRepository;
  let feedRepository: FeedRepository;
  let commentRepository: CommentRepository;

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
    rssAcceptRepository = testApp.get(RssAcceptRepository);
    feedRepository = testApp.get(FeedRepository);
    commentRepository = testApp.get(CommentRepository);
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

  it('[401] 관리자 세션 쿠키가 없으면 신고 목록 조회를 실패한다.', async () => {
    // Http when
    const response = await agent.get(BASE_URL);

    // Http then
    expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
  });

  it('[200] USER 신고는 신고당한 유저 정보를 target.user로 반환한다.', async () => {
    // given
    await reportRepository.insert({
      reporter: { id: reporter.id },
      targetType: ReportTargetType.USER,
      targetId: target.id,
      reportedUser: { id: target.id },
      reason: ReportReason.ABUSE,
    });
    const saved = await reportRepository.findOneByOrFail({
      targetId: target.id,
      targetType: ReportTargetType.USER,
    });

    // Http when
    const response = await agent
      .get(BASE_URL)
      .set('Cookie', `sessionId=${sessionKey}`);

    // Http then
    const { data } = response.body as { data: { result: unknown[] } };
    expect(response.status).toBe(HttpStatus.OK);
    expect(data.result).toStrictEqual([
      {
        id: saved.id,
        targetType: ReportTargetType.USER,
        targetId: target.id,
        target: {
          feed: null,
          rss: null,
          rssOwner: null,
          user: {
            id: target.id,
            userName: target.userName,
            profileImage: target.profileImage ?? null,
          },
          comment: null,
        },
        reason: ReportReason.ABUSE,
        detail: null,
        reporter: { userName: reporter.userName },
        createdAt: saved.createdAt.toISOString(),
      },
    ]);
  });

  it('[200] COMMENT 신고는 게시글 정보와 댓글 작성자·내용을 target으로 반환한다.', async () => {
    // given
    const rssAccept = await rssAcceptRepository.save(
      RssAcceptFixture.createRssAcceptFixture(),
    );
    const feed = await feedRepository.save(
      FeedFixture.createFeedFixture(rssAccept),
    );
    const commentAuthor = await userRepository.save(
      await UserFixture.createUserCryptFixture(),
    );
    const comment = await commentRepository.save(
      CommentFixture.createCommentFixture(feed, commentAuthor),
    );
    await reportRepository.insert({
      reporter: { id: reporter.id },
      targetType: ReportTargetType.COMMENT,
      targetId: comment.id,
      reportedComment: { id: comment.id },
      reason: ReportReason.SPAM,
    });
    const saved = await reportRepository.findOneByOrFail({
      targetId: comment.id,
      targetType: ReportTargetType.COMMENT,
    });

    // Http when
    const response = await agent
      .get(BASE_URL)
      .set('Cookie', `sessionId=${sessionKey}`);

    // Http then
    const { data } = response.body as { data: { result: unknown[] } };
    expect(response.status).toBe(HttpStatus.OK);
    expect(data.result).toStrictEqual([
      {
        id: saved.id,
        targetType: ReportTargetType.COMMENT,
        targetId: comment.id,
        target: {
          feed: { id: feed.id, title: feed.title, thumbnail: feed.thumbnail },
          rss: null,
          rssOwner: null,
          user: {
            id: commentAuthor.id,
            userName: commentAuthor.userName,
            profileImage: commentAuthor.profileImage ?? null,
          },
          comment: COMMENT_DEFAULT_TEXT,
        },
        reason: ReportReason.SPAM,
        detail: null,
        reporter: { userName: reporter.userName },
        createdAt: saved.createdAt.toISOString(),
      },
    ]);
  });

  it('[200] FEED 신고는 게시글 정보와 소속 RSS·RSS 소유자 정보를 target으로 반환한다.', async () => {
    // given
    const rssOwner = await userRepository.save(
      await UserFixture.createUserCryptFixture(),
    );
    const rssAccept = await rssAcceptRepository.save(
      RssAcceptFixture.createRssAcceptFixture({ userId: rssOwner.id }),
    );
    const feed = await feedRepository.save(
      FeedFixture.createFeedFixture(rssAccept),
    );
    await reportRepository.insert({
      reporter: { id: reporter.id },
      targetType: ReportTargetType.FEED,
      targetId: feed.id,
      reportedFeed: { id: feed.id },
      reason: ReportReason.ETC,
    });
    const saved = await reportRepository.findOneByOrFail({
      targetId: feed.id,
      targetType: ReportTargetType.FEED,
    });

    // Http when
    const response = await agent
      .get(BASE_URL)
      .set('Cookie', `sessionId=${sessionKey}`);

    // Http then
    const { data } = response.body as { data: { result: unknown[] } };
    expect(response.status).toBe(HttpStatus.OK);
    expect(data.result).toStrictEqual([
      {
        id: saved.id,
        targetType: ReportTargetType.FEED,
        targetId: feed.id,
        target: {
          feed: { id: feed.id, title: feed.title, thumbnail: feed.thumbnail },
          rss: {
            id: rssAccept.id,
            name: rssAccept.name,
            image: rssAccept.blogImage ?? null,
          },
          rssOwner: {
            id: rssOwner.id,
            userName: rssOwner.userName,
            profileImage: rssOwner.profileImage ?? null,
          },
          user: null,
          comment: null,
        },
        reason: ReportReason.ETC,
        detail: null,
        reporter: { userName: reporter.userName },
        createdAt: saved.createdAt.toISOString(),
      },
    ]);
  });

  it('[200] RSS 신고는 RSS 정보와 RSS 소유자 정보를 target으로 반환한다.', async () => {
    // given
    const rssOwner = await userRepository.save(
      await UserFixture.createUserCryptFixture(),
    );
    const rssAccept = await rssAcceptRepository.save(
      RssAcceptFixture.createRssAcceptFixture({ userId: rssOwner.id }),
    );
    await reportRepository.insert({
      reporter: { id: reporter.id },
      targetType: ReportTargetType.RSS,
      targetId: rssAccept.id,
      reportedRss: { id: rssAccept.id },
      reason: ReportReason.COPYRIGHT,
    });
    const saved = await reportRepository.findOneByOrFail({
      targetId: rssAccept.id,
      targetType: ReportTargetType.RSS,
    });

    // Http when
    const response = await agent
      .get(BASE_URL)
      .set('Cookie', `sessionId=${sessionKey}`);

    // Http then
    const { data } = response.body as { data: { result: unknown[] } };
    expect(response.status).toBe(HttpStatus.OK);
    expect(data.result).toStrictEqual([
      {
        id: saved.id,
        targetType: ReportTargetType.RSS,
        targetId: rssAccept.id,
        target: {
          feed: null,
          rss: {
            id: rssAccept.id,
            name: rssAccept.name,
            image: rssAccept.blogImage ?? null,
          },
          rssOwner: {
            id: rssOwner.id,
            userName: rssOwner.userName,
            profileImage: rssOwner.profileImage ?? null,
          },
          user: null,
          comment: null,
        },
        reason: ReportReason.COPYRIGHT,
        detail: null,
        reporter: { userName: reporter.userName },
        createdAt: saved.createdAt.toISOString(),
      },
    ]);
  });

  it('[200] 신고자가 탈퇴한 경우 reporter는 null로 반환된다.', async () => {
    // given
    await reportRepository.insert({
      reporter: { id: reporter.id },
      targetType: ReportTargetType.USER,
      targetId: target.id,
      reportedUser: { id: target.id },
      reason: ReportReason.ABUSE,
    });
    await userRepository.remove(reporter);

    // Http when
    const response = await agent
      .get(BASE_URL)
      .set('Cookie', `sessionId=${sessionKey}`);

    // Http then
    const { data } = response.body as {
      data: { result: { reporter: unknown }[] };
    };
    expect(response.status).toBe(HttpStatus.OK);
    expect(data.result[0].reporter).toBeNull();
  });
});
