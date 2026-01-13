import { HttpStatus } from '@nestjs/common';
import supertest from 'supertest';
import { UserRepository } from '@user/repository/user.repository';
import { UserFixture } from '@test/config/common/fixture/user.fixture';
import { DeleteCommentRequestDto } from '@comment/dto/request/deleteComment.dto';
import { Comment } from '@comment/entity/comment.entity';
import { CommentRepository } from '@comment/repository/comment.repository';
import { CommentFixture } from '@test/config/common/fixture/comment.fixture';
import { FeedRepository } from '@feed/repository/feed.repository';
import { FeedFixture } from '@test/config/common/fixture/feed.fixture';
import { RssAcceptFixture } from '@test/config/common/fixture/rss-accept.fixture';
import { RssAcceptRepository } from '@rss/repository/rss.repository';
import TestAgent from 'supertest/lib/agent';
import { createAccessToken } from '@test/config/e2e/env/jest.setup';
import { User } from '@user/entity/user.entity';
import { RssAccept } from '@rss/entity/rss.entity';
import { Feed } from '@feed/entity/feed.entity';
import { testApp } from '@test/config/e2e/env/jest.setup';

const URL = '/api/comment';

describe(`DELETE ${URL} E2E Test`, () => {
  let agent: TestAgent;
  let comment: Comment;
  let user: User;
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
    [user, feed] = await Promise.all([
      userRepository.save(await UserFixture.createUserCryptFixture()),
      feedRepository.save(FeedFixture.createFeedFixture(rssAccept)),
    ]);
    comment = await commentRepository.save(
      CommentFixture.createCommentFixture(feed, user),
    );
    accessToken = createAccessToken(user);
  });

  it('[401] 로그인이 되어 있지 않을 경우 댓글 삭제를 실패한다.', async () => {
    // given
    const requestDto = new DeleteCommentRequestDto({
      commentId: comment.id,
    });

    // Http when
    const response = await agent.delete(URL).send(requestDto);

    // Http then
    const { data } = response.body;
    expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
    expect(data).toBeUndefined();

    // DB, Redis when
    const savedComment = await commentRepository.findOneBy({
      id: requestDto.commentId,
    });

    // DB, Redis then
    expect(savedComment).not.toBeNull();
  });

  it('[404] 삭제하고자 하는 댓글이 존재하지 않을 경우 댓글 삭제를 실패한다.', async () => {
    // given
    const requestDto = new DeleteCommentRequestDto({
      commentId: Number.MAX_SAFE_INTEGER,
    });

    // Http when
    const response = await agent
      .delete(URL)
      .set('Authorization', `Bearer ${accessToken}`)
      .send(requestDto);

    // Http then
    const { data } = response.body;
    expect(response.status).toBe(HttpStatus.NOT_FOUND);
    expect(data).toBeUndefined();

    // DB, Redis when
    const savedComment = await commentRepository.findOneBy({
      id: requestDto.commentId,
    });

    // DB, Redis then
    expect(savedComment).toBeNull();
  });

  it('[401] 본인이 작성한 댓글이 아닐 경우 댓글 삭제를 실패한다.', async () => {
    // given
    accessToken = createAccessToken({ id: Number.MAX_SAFE_INTEGER });
    const requestDto = new DeleteCommentRequestDto({
      commentId: comment.id,
    });

    // Http when
    const response = await agent
      .delete(URL)
      .set('Authorization', `Bearer ${accessToken}`)
      .send(requestDto);

    // Http then
    const { data } = response.body;
    expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
    expect(data).toBeUndefined();

    // DB, Redis when
    const savedComment = await commentRepository.findOneBy({
      id: requestDto.commentId,
    });

    // DB, Redis then
    expect(savedComment).not.toBeNull();
  });

  it('[200] 본인이 작성한 댓글일 경우 댓글 삭제를 성공한다.', async () => {
    // given
    const requestDto = new DeleteCommentRequestDto({
      commentId: comment.id,
    });

    // Http when
    const response = await agent
      .delete(URL)
      .set('Authorization', `Bearer ${accessToken}`)
      .send(requestDto);

    // Http then
    const { data } = response.body;
    expect(response.status).toBe(HttpStatus.OK);
    expect(data).toBeUndefined();

    // DB, Redis when
    const savedComment = await commentRepository.findOneBy({
      id: requestDto.commentId,
    });

    // DB, Redis then
    expect(savedComment).toBeNull();
  });
});
