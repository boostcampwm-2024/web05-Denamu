import { HttpStatus, INestApplication } from '@nestjs/common';
import * as supertest from 'supertest';
import { UserRepository } from '../../../src/user/repository/user.repository';
import { UserFixture } from '../../fixture/user.fixture';
import { DeleteCommentRequestDto } from '../../../src/comment/dto/request/deleteComment.dto';
import { Comment } from '../../../src/comment/entity/comment.entity';
import { CommentRepository } from '../../../src/comment/repository/comment.repository';
import { CommentFixture } from '../../fixture/comment.fixture';
import { FeedRepository } from '../../../src/feed/repository/feed.repository';
import { FeedFixture } from '../../fixture/feed.fixture';
import { RssAcceptFixture } from '../../fixture/rss-accept.fixture';
import { RssAcceptRepository } from '../../../src/rss/repository/rss.repository';
import TestAgent from 'supertest/lib/agent';
import { createAccessToken } from '../../config/e2e/env/jest.setup';
import { User } from '../../../src/user/entity/user.entity';

const URL = '/api/comment';

describe(`DELETE ${URL} E2E Test`, () => {
  let app: INestApplication;
  let agent: TestAgent;
  let comment: Comment;
  let commentRepository: CommentRepository;
  let user: User;

  beforeAll(async () => {
    app = global.testApp;
    agent = supertest(app.getHttpServer());
    commentRepository = app.get(CommentRepository);
    const userRepository = app.get(UserRepository);
    const rssAcceptRepository = app.get(RssAcceptRepository);
    const feedRepository = app.get(FeedRepository);
    const rssAccept = await rssAcceptRepository.save(
      RssAcceptFixture.createRssAcceptFixture(),
    );
    const feed = await feedRepository.save(
      FeedFixture.createFeedFixture(rssAccept),
    );

    user = await userRepository.save(
      await UserFixture.createUserCryptFixture(),
    );
    comment = await commentRepository.save(
      CommentFixture.createCommentFixture(feed, user),
    );
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
    const accessToken = createAccessToken(user);
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
    const accessToken = createAccessToken({ id: Number.MAX_SAFE_INTEGER });
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
    const accessToken = createAccessToken(user);
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
