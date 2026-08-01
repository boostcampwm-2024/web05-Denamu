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

import { RssAccept } from '@rss/entity/rss.entity';
import { RssAcceptRepository } from '@rss/repository/rss.repository';

import { User } from '@user/entity/user.entity';
import { UserRepository } from '@user/repository/user.repository';

import { AdminFixture } from '@test/config/common/fixture/admin.fixture';
import { CommentFixture } from '@test/config/common/fixture/comment.fixture';
import { FeedFixture } from '@test/config/common/fixture/feed.fixture';
import { RssAcceptFixture } from '@test/config/common/fixture/rss-accept.fixture';
import { UserFixture } from '@test/config/common/fixture/user.fixture';
import { testApp } from '@test/config/e2e/env/jest.setup';

const URL = (commentId: number | string) => `/api/admins/comments/${commentId}`;

describe(`DELETE /api/admins/comments/:commentId E2E Test`, () => {
  let agent: TestAgent;
  let redisService: RedisService;
  let adminRepository: AdminRepository;
  let commentRepository: CommentRepository;
  let userRepository: UserRepository;
  let rssAcceptRepository: RssAcceptRepository;
  let feedRepository: FeedRepository;

  const sessionKey = 'admin-comment-delete-session-key';
  const redisKeyMake = (data: string) => `${REDIS_KEYS.ADMIN_AUTH_KEY}:${data}`;

  let feed: Feed;
  let user: User;
  let comment: Comment;

  beforeAll(() => {
    agent = supertest(testApp.getHttpServer());
    redisService = testApp.get(RedisService);
    adminRepository = testApp.get(AdminRepository);
    commentRepository = testApp.get(CommentRepository);
    userRepository = testApp.get(UserRepository);
    rssAcceptRepository = testApp.get(RssAcceptRepository);
    feedRepository = testApp.get(FeedRepository);
  });

  beforeEach(async () => {
    const admin = await adminRepository.save(
      await AdminFixture.createAdminCryptFixture(),
    );
    await redisService.set(redisKeyMake(sessionKey), admin.email);

    const rssAccept: RssAccept = await rssAcceptRepository.save(
      RssAcceptFixture.createRssAcceptFixture(),
    );
    [user, feed] = await Promise.all([
      userRepository.save(await UserFixture.createUserCryptFixture()),
      feedRepository.save(
        FeedFixture.createFeedFixture(rssAccept, { commentCount: 1 }),
      ),
    ]);
    comment = await commentRepository.save(
      CommentFixture.createCommentFixture(feed, user),
    );
  });

  it('[401] 관리자 세션 쿠키가 없으면 삭제를 실패한다.', async () => {
    // Http when
    const response = await agent.delete(URL(comment.id));

    // Http then
    expect(response.status).toBe(HttpStatus.UNAUTHORIZED);

    // DB then
    const found = await commentRepository.findOneBy({ id: comment.id });
    expect(found.isDeleted).toBe(false);
    expect(found.isAdminDeleted).toBe(false);
  });

  it('[404] 존재하지 않는 댓글 삭제를 실패한다.', async () => {
    // Http when
    const response = await agent
      .delete(URL(999999))
      .set('Cookie', `sessionId=${sessionKey}`);

    // Http then
    expect(response.status).toBe(HttpStatus.NOT_FOUND);
  });

  it('[200] 어떤 유저의 댓글이든 soft delete + 관리자 삭제 플래그를 세우고 commentCount는 유지한다.', async () => {
    // Http when
    const response = await agent
      .delete(URL(comment.id))
      .set('Cookie', `sessionId=${sessionKey}`);

    // Http then
    expect(response.status).toBe(HttpStatus.OK);

    // DB then - 댓글은 남아 있고 플래그만 세워짐
    const found = await commentRepository.findOneBy({ id: comment.id });
    expect(found).not.toBeNull();
    expect(found.isDeleted).toBe(true);
    expect(found.isAdminDeleted).toBe(true);

    // DB then - commentCount는 변동 없음
    const foundFeed = await feedRepository.findOneBy({ id: feed.id });
    expect(foundFeed.commentCount).toBe(1);
  });
});
