import { HttpStatus } from '@nestjs/common';

import supertest from 'supertest';
import TestAgent from 'supertest/lib/agent';

import { CreateCommentRequestDto } from '@comment/dto/request/createComment.dto';
import { CommentRepository } from '@comment/repository/comment.repository';

import { Feed } from '@feed/entity/feed.entity';
import { FeedRepository } from '@feed/repository/feed.repository';

import { RssAccept } from '@rss/entity/rss.entity';
import { RssAcceptRepository } from '@rss/repository/rss.repository';

import { User } from '@user/entity/user.entity';
import { UserRepository } from '@user/repository/user.repository';

import {
  COMMENT_DEFAULT_TEXT,
  CommentFixture,
} from '@test/config/common/fixture/comment.fixture';
import { FeedFixture } from '@test/config/common/fixture/feed.fixture';
import { RssAcceptFixture } from '@test/config/common/fixture/rss-accept.fixture';
import { UserFixture } from '@test/config/common/fixture/user.fixture';
import { createAccessToken } from '@test/config/e2e/env/jest.setup';
import { testApp } from '@test/config/e2e/env/jest.setup';

const BASE_URL = '/api/feeds';

describe(`POST ${BASE_URL}/:feedId/comments E2E Test`, () => {
  let agent: TestAgent;
  let user: User;
  let feed: Feed;
  let rssAccept: RssAccept;
  let commentRepository: CommentRepository;
  let rssAcceptRepository: RssAcceptRepository;
  let userRepository: UserRepository;
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
    [user, feed] = await Promise.all([
      userRepository.save(await UserFixture.createUserCryptFixture()),
      feedRepository.save(FeedFixture.createFeedFixture(rssAccept)),
    ]);
    accessToken = createAccessToken(user);
  });

  it('[401] 로그인이 되어 있지 않을 경우 댓글 등록을 실패한다.', async () => {
    // given
    const requestDto = new CreateCommentRequestDto({
      comment: COMMENT_DEFAULT_TEXT,
    });

    // Http when
    const response = await agent
      .post(`${BASE_URL}/${feed.id}/comments`)
      .send(requestDto);

    // Http then
    const { data } = response.body;
    expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
    expect(data).toBeUndefined();

    // DB, Redis when
    const savedComment = await commentRepository.findOneBy({
      comment: requestDto.comment,
      feed: { id: feed.id },
    });

    // DB, Redis then
    expect(savedComment).toBeNull();
  });

  it('[404] 게시글이 존재하지 않을 경우 댓글 등록을 실패한다.', async () => {
    // given
    const requestDto = new CreateCommentRequestDto({
      comment: COMMENT_DEFAULT_TEXT,
    });

    // Http when
    const response = await agent
      .post(`${BASE_URL}/${Number.MAX_SAFE_INTEGER}/comments`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send(requestDto);

    // Http then
    const { data } = response.body;
    expect(response.status).toBe(HttpStatus.NOT_FOUND);
    expect(data).toBeUndefined();
  });

  it('[404] 비공개 게시글에는 댓글을 등록할 수 없다.', async () => {
    // given
    const privateFeed = await feedRepository.save(
      FeedFixture.createFeedFixture(rssAccept, { isPublic: false }),
    );
    const requestDto = new CreateCommentRequestDto({
      comment: COMMENT_DEFAULT_TEXT,
    });

    // Http when
    const response = await agent
      .post(`${BASE_URL}/${privateFeed.id}/comments`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send(requestDto);

    // Http then
    expect(response.status).toBe(HttpStatus.NOT_FOUND);
    const savedComment = await commentRepository.findOneBy({
      feed: { id: privateFeed.id },
    });
    expect(savedComment).toBeNull();
  });

  it('[201] 로그인이 되어 있을 경우 댓글 등록을 성공한다.', async () => {
    // given
    const requestDto = new CreateCommentRequestDto({
      comment: COMMENT_DEFAULT_TEXT,
    });

    // Http when
    const response = await agent
      .post(`${BASE_URL}/${feed.id}/comments`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send(requestDto);

    // Http then
    const { data } = response.body;
    expect(response.status).toBe(HttpStatus.CREATED);
    expect(data).toBeUndefined();

    // DB, Redis when
    const savedComment = await commentRepository.findOneBy({
      feed: { id: feed.id },
      user: { id: user.id },
    });

    // DB, Redis then
    expect(savedComment).not.toBeNull();
  });

  it('[201] 최상위 댓글에 답글 등록을 성공하고 parentId가 저장된다.', async () => {
    // given
    const parent = await commentRepository.save(
      CommentFixture.createCommentFixture(feed, user),
    );
    const requestDto = new CreateCommentRequestDto({
      comment: '답글입니다',
      parentId: parent.id,
    });

    // Http when
    const response = await agent
      .post(`${BASE_URL}/${feed.id}/comments`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send(requestDto);

    // Http then
    expect(response.status).toBe(HttpStatus.CREATED);

    // DB when
    const reply = await commentRepository.findOneBy({ comment: '답글입니다' });

    // DB then
    expect(reply).not.toBeNull();
    expect(reply.parentId).toBe(parent.id);
  });

  it('[400] 답글에 답글을 달 수 없다(2단계 초과).', async () => {
    // given - 부모(root) → 답글(reply) 생성 후, reply를 부모로 지정
    const parent = await commentRepository.save(
      CommentFixture.createCommentFixture(feed, user),
    );
    const reply = await commentRepository.save(
      CommentFixture.createCommentFixture(feed, user, { parentId: parent.id }),
    );
    const requestDto = new CreateCommentRequestDto({
      comment: '답답글',
      parentId: reply.id,
    });

    // Http when
    const response = await agent
      .post(`${BASE_URL}/${feed.id}/comments`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send(requestDto);

    // Http then
    expect(response.status).toBe(HttpStatus.BAD_REQUEST);
    const saved = await commentRepository.findOneBy({ comment: '답답글' });
    expect(saved).toBeNull();
  });

  it('[400] 부모 댓글이 다른 게시글에 속할 경우 답글 등록을 실패한다.', async () => {
    // given - 다른 게시글의 댓글을 부모로 지정
    const otherFeed = await feedRepository.save(
      FeedFixture.createFeedFixture(rssAccept),
    );
    const otherParent = await commentRepository.save(
      CommentFixture.createCommentFixture(otherFeed, user),
    );
    const requestDto = new CreateCommentRequestDto({
      comment: '잘못된 답글',
      parentId: otherParent.id,
    });

    // Http when
    const response = await agent
      .post(`${BASE_URL}/${feed.id}/comments`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send(requestDto);

    // Http then
    expect(response.status).toBe(HttpStatus.BAD_REQUEST);
    const saved = await commentRepository.findOneBy({ comment: '잘못된 답글' });
    expect(saved).toBeNull();
  });

  it('[404] 존재하지 않는 부모 댓글에는 답글을 등록할 수 없다.', async () => {
    // given
    const requestDto = new CreateCommentRequestDto({
      comment: '유령 답글',
      parentId: Number.MAX_SAFE_INTEGER,
    });

    // Http when
    const response = await agent
      .post(`${BASE_URL}/${feed.id}/comments`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send(requestDto);

    // Http then
    expect(response.status).toBe(HttpStatus.NOT_FOUND);
    const saved = await commentRepository.findOneBy({ comment: '유령 답글' });
    expect(saved).toBeNull();
  });
});
