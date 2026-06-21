import { HttpStatus } from '@nestjs/common';

import supertest from 'supertest';
import TestAgent from 'supertest/lib/agent';

import { Comment } from '@comment/entity/comment.entity';
import { CommentRepository } from '@comment/repository/comment.repository';

import { Feed } from '@feed/entity/feed.entity';
import { FeedRepository } from '@feed/repository/feed.repository';

import { RssAccept } from '@rss/entity/rss.entity';
import { RssAcceptRepository } from '@rss/repository/rss.repository';

import { User } from '@user/entity/user.entity';
import { UserRepository } from '@user/repository/user.repository';

import { CommentFixture } from '@test/config/common/fixture/comment.fixture';
import { FeedFixture } from '@test/config/common/fixture/feed.fixture';
import { RssAcceptFixture } from '@test/config/common/fixture/rss-accept.fixture';
import { UserFixture } from '@test/config/common/fixture/user.fixture';
import { createAccessToken } from '@test/config/e2e/env/jest.setup';
import { testApp } from '@test/config/e2e/env/jest.setup';

const BASE_URL = '/api/feeds';

describe(`DELETE ${BASE_URL}/:feedId/comments/:commentId E2E Test`, () => {
  let agent: TestAgent;
  let comment: Comment;
  let user: User, user2: User;
  let rssAccept: RssAccept;
  let feed: Feed;
  let commentRepository: CommentRepository;
  let userRepository: UserRepository;
  let rssAcceptRepository: RssAcceptRepository;
  let feedRepository: FeedRepository;
  let accessToken: string;

  beforeAll(() => {
    agent = supertest(testApp.getHttpServer());
    commentRepository = testApp.get(CommentRepository);
    userRepository = testApp.get(UserRepository);
    rssAcceptRepository = testApp.get(RssAcceptRepository);
    feedRepository = testApp.get(FeedRepository);
  });

  beforeEach(async () => {
    rssAccept = await rssAcceptRepository.save(
      RssAcceptFixture.createRssAcceptFixture(),
    );
    [user, user2, feed] = await Promise.all([
      userRepository.save(await UserFixture.createUserCryptFixture()),
      userRepository.save(await UserFixture.createUserCryptFixture()),
      feedRepository.save(FeedFixture.createFeedFixture(rssAccept)),
    ]);
    comment = await commentRepository.save(
      CommentFixture.createCommentFixture(feed, user),
    );
    accessToken = createAccessToken(user);
  });

  it('[401] 로그인이 되어 있지 않을 경우 댓글 삭제를 실패한다.', async () => {
    // Http when
    const response = await agent.delete(
      `${BASE_URL}/${feed.id}/comments/${comment.id}`,
    );

    // Http then
    const { data } = response.body;
    expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
    expect(data).toBeUndefined();

    // DB, Redis when
    const savedComment = await commentRepository.findOneBy({
      id: comment.id,
    });

    // DB, Redis then
    expect(savedComment).not.toBeNull();
  });

  it('[404] 삭제하고자 하는 댓글이 존재하지 않을 경우 댓글 삭제를 실패한다.', async () => {
    // Http when
    const response = await agent
      .delete(`${BASE_URL}/${feed.id}/comments/${Number.MAX_SAFE_INTEGER}`)
      .set('Authorization', `Bearer ${accessToken}`);

    // Http then
    const { data } = response.body;
    expect(response.status).toBe(HttpStatus.NOT_FOUND);
    expect(data).toBeUndefined();
  });

  it('[403] 본인이 작성한 댓글이 아닐 경우 댓글 삭제를 실패한다.', async () => {
    // given
    accessToken = createAccessToken({ id: user2.id });

    // Http when
    const response = await agent
      .delete(`${BASE_URL}/${feed.id}/comments/${comment.id}`)
      .set('Authorization', `Bearer ${accessToken}`);

    // Http then
    const { data } = response.body;
    expect(response.status).toBe(HttpStatus.FORBIDDEN);
    expect(data).toBeUndefined();

    // DB, Redis when
    const savedComment = await commentRepository.findOneBy({
      id: comment.id,
    });

    // DB, Redis then
    expect(savedComment).not.toBeNull();
  });

  it('[200] 본인 댓글이 아니어도 게시글의 RSS 소유자일 경우 댓글 삭제를 성공한다.', async () => {
    // given - user2가 RSS 소유자, 댓글 작성자는 user
    rssAccept.userId = user2.id;
    await rssAcceptRepository.save(rssAccept);
    accessToken = createAccessToken({ id: user2.id });

    // Http when
    const response = await agent
      .delete(`${BASE_URL}/${feed.id}/comments/${comment.id}`)
      .set('Authorization', `Bearer ${accessToken}`);

    // Http then
    const { data } = response.body;
    expect(response.status).toBe(HttpStatus.OK);
    expect(data).toBeUndefined();

    // DB, Redis when
    const savedComment = await commentRepository.findOneBy({
      id: comment.id,
    });

    // DB, Redis then
    expect(savedComment).toBeNull();
  });

  it('[200] 본인이 작성한 댓글일 경우 댓글 삭제를 성공한다.', async () => {
    // Http when
    const response = await agent
      .delete(`${BASE_URL}/${feed.id}/comments/${comment.id}`)
      .set('Authorization', `Bearer ${accessToken}`);

    // Http then
    const { data } = response.body;
    expect(response.status).toBe(HttpStatus.OK);
    expect(data).toBeUndefined();

    // DB, Redis when
    const savedComment = await commentRepository.findOneBy({
      id: comment.id,
    });

    // DB, Redis then
    expect(savedComment).toBeNull();
  });
});
