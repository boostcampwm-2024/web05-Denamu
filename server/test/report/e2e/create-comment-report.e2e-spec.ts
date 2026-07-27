import { HttpStatus } from '@nestjs/common';

import supertest from 'supertest';
import TestAgent from 'supertest/lib/agent';

import { Comment } from '@comment/entity/comment.entity';
import { CommentRepository } from '@comment/repository/comment.repository';

import { Feed } from '@feed/entity/feed.entity';
import { FeedRepository } from '@feed/repository/feed.repository';

import { ReportReason, ReportTargetType } from '@report/constant/report.constant';
import { ReportRepository } from '@report/repository/report.repository';

import { RssAccept } from '@rss/entity/rss.entity';
import { RssAcceptRepository } from '@rss/repository/rss.repository';

import { User } from '@user/entity/user.entity';
import { UserRepository } from '@user/repository/user.repository';

import { CommentFixture } from '@test/config/common/fixture/comment.fixture';
import { FeedFixture } from '@test/config/common/fixture/feed.fixture';
import { RssAcceptFixture } from '@test/config/common/fixture/rss-accept.fixture';
import { UserFixture } from '@test/config/common/fixture/user.fixture';
import { createAccessToken, testApp } from '@test/config/e2e/env/jest.setup';

const BASE_URL = '/api/reports/comments';

describe(`POST ${BASE_URL}/:commentId E2E Test`, () => {
  let agent: TestAgent;
  let reportRepository: ReportRepository;
  let commentRepository: CommentRepository;
  let feedRepository: FeedRepository;
  let rssAcceptRepository: RssAcceptRepository;
  let userRepository: UserRepository;
  let reporter: User;
  let commentAuthor: User;
  let feed: Feed;
  let targetComment: Comment;
  let accessToken: string;

  beforeAll(() => {
    agent = supertest(testApp.getHttpServer());
    reportRepository = testApp.get(ReportRepository);
    commentRepository = testApp.get(CommentRepository);
    feedRepository = testApp.get(FeedRepository);
    rssAcceptRepository = testApp.get(RssAcceptRepository);
    userRepository = testApp.get(UserRepository);
  });

  beforeEach(async () => {
    const rssAccept: RssAccept = await rssAcceptRepository.save(RssAcceptFixture.createRssAcceptFixture());
    [reporter, commentAuthor] = await Promise.all([
      userRepository.save(await UserFixture.createUserCryptFixture()),
      userRepository.save(await UserFixture.createUserCryptFixture()),
    ]);
    feed = await feedRepository.save(FeedFixture.createFeedFixture(rssAccept));
    targetComment = await commentRepository.save(CommentFixture.createCommentFixture(feed, commentAuthor));
    accessToken = createAccessToken(reporter);
  });

  it('[404] 신고 대상 댓글이 존재하지 않을 경우 실패한다.', async () => {
    // Http when
    const response = await agent
      .post(`${BASE_URL}/${Number.MAX_SAFE_INTEGER}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ reason: ReportReason.SPAM });

    // Http then
    expect(response.status).toBe(HttpStatus.NOT_FOUND);
  });

  it('[400] 자신의 댓글을 신고할 경우 실패한다.', async () => {
    // given
    const ownComment = await commentRepository.save(CommentFixture.createCommentFixture(feed, reporter));

    // Http when
    const response = await agent
      .post(`${BASE_URL}/${ownComment.id}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ reason: ReportReason.SPAM });

    // Http then
    expect(response.status).toBe(HttpStatus.BAD_REQUEST);
  });

  it('[201] 댓글 신고 등록을 성공한다.', async () => {
    // Http when
    const response = await agent
      .post(`${BASE_URL}/${targetComment.id}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ reason: ReportReason.ETC, detail: '부적절한 댓글입니다.' });

    // Http then
    expect(response.status).toBe(HttpStatus.CREATED);

    // DB when
    const saved = await reportRepository.findOneBy({
      reporter: { id: reporter.id },
      targetType: ReportTargetType.COMMENT,
      targetId: targetComment.id,
    });

    // DB then
    expect(saved).not.toBeNull();
    expect(saved.reason).toBe(ReportReason.ETC);
  });
});
