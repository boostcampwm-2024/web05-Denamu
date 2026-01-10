import { UpdateCommentRequestDto } from '@comment/dto/request/updateComment.dto';
import { Comment } from '@comment/entity/comment.entity';
import { CommentRepository } from '@comment/repository/comment.repository';

import { Feed } from '@feed/entity/feed.entity';
import { FeedRepository } from '@feed/repository/feed.repository';

import { RssAcceptRepository } from '@rss/repository/rss.repository';

import { User } from '@user/entity/user.entity';
import { UserRepository } from '@user/repository/user.repository';

import { CommentFixture } from '@test/config/common/fixture/comment.fixture';
import { FeedFixture } from '@test/config/common/fixture/feed.fixture';
import { RssAcceptFixture } from '@test/config/common/fixture/rss-accept.fixture';
import { UserFixture } from '@test/config/common/fixture/user.fixture';
import { createAccessToken } from '@test/config/e2e/env/jest.setup';
import { testApp } from '@test/config/e2e/env/jest.setup';

import { HttpStatus } from '@nestjs/common';
import supertest from 'supertest';
import TestAgent from 'supertest/lib/agent';

import { RssAccept } from './../../../src/rss/entity/rss.entity';

const URL = '/api/comment';

describe(`PATCH ${URL} E2E Test`, () => {
  let agent: TestAgent;
  let comment: Comment;
  let userRepository: UserRepository;
  let commentRepository: CommentRepository;
  let rssAcceptRepository: RssAcceptRepository;
  let feedRepository: FeedRepository;
  let rssAccept: RssAccept;
  let feed: Feed;
  let user: User;
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
    [user, feed] = await Promise.all([
      userRepository.save(await UserFixture.createUserCryptFixture()),
      feedRepository.save(FeedFixture.createFeedFixture(rssAccept)),
    ]);
    comment = await commentRepository.save(
      CommentFixture.createCommentFixture(feed, user),
    );
    accessToken = createAccessToken(user);
  });

  it('[401] 로그인이 되어있지 않을 경우 댓글 수정을 실패한다.', async () => {
    // given
    const requestDto = new UpdateCommentRequestDto({
      commentId: comment.id,
      newComment: 'newComment',
    });

    // Http when
    const response = await agent.patch(URL).send(requestDto);

    // Http then
    const { data } = response.body;
    expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
    expect(data).toBeUndefined();

    // DB, Redis when
    const savedComment = await commentRepository.findOneBy({
      id: comment.id,
    });

    // DB, Redis then
    expect(savedComment.comment).toBe(comment.comment);
  });

  it('[404] 댓글이 존재하지 않을 경우 댓글 수정을 실패한다.', async () => {
    // given
    const requestDto = new UpdateCommentRequestDto({
      commentId: Number.MAX_SAFE_INTEGER,
      newComment: 'newComment',
    });

    // Http when
    const response = await agent
      .patch(URL)
      .set('Authorization', `Bearer ${accessToken}`)
      .send(requestDto);

    // Http then
    const { data } = response.body;
    expect(response.status).toBe(HttpStatus.NOT_FOUND);
    expect(data).toBeUndefined();

    // DB, Redis when
    const savedComment = await commentRepository.findOneBy({
      id: comment.id,
    });

    // DB, Redis then
    expect(savedComment.comment).toBe(comment.comment);
  });

  it('[401] 본인이 작성한 댓글이 아닐 경우 댓글 수정을 실패한다.', async () => {
    // given
    const requestDto = new UpdateCommentRequestDto({
      commentId: comment.id,
      newComment: 'newComment',
    });
    accessToken = createAccessToken({ id: Number.MAX_SAFE_INTEGER });

    // Http when
    const response = await agent
      .patch(URL)
      .set('Authorization', `Bearer ${accessToken}`)
      .send(requestDto);

    // Http then
    const { data } = response.body;
    expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
    expect(data).toBeUndefined();

    // DB, Redis when
    const savedComment = await commentRepository.findOneBy({
      id: comment.id,
    });

    // DB, Redis then
    expect(savedComment.comment).toBe(comment.comment);
  });

  it('[200] 본인이 작성한 댓글일 경우 댓글 수정을 성공한다.', async () => {
    // given
    const requestDto = new UpdateCommentRequestDto({
      commentId: comment.id,
      newComment: 'newComment',
    });

    // Http when
    const response = await agent
      .patch(URL)
      .set('Authorization', `Bearer ${accessToken}`)
      .send(requestDto);

    // Http then
    const { data } = response.body;
    expect(response.status).toBe(HttpStatus.OK);
    expect(data).toBeUndefined();

    // DB, Redis when
    const savedComment = await commentRepository.findOneBy({
      id: comment.id,
    });

    // DB, Redis then
    expect(savedComment.comment).toBe(requestDto.newComment);
  });
});
