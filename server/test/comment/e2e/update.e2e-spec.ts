import { HttpStatus, INestApplication } from '@nestjs/common';
import * as supertest from 'supertest';
import { UserRepository } from '../../../src/user/repository/user.repository';
import { UserFixture } from '../../config/fixture/user.fixture';
import { Comment } from '../../../src/comment/entity/comment.entity';
import { FeedRepository } from '../../../src/feed/repository/feed.repository';
import { CommentRepository } from '../../../src/comment/repository/comment.repository';
import { RssAcceptFixture } from '../../config/fixture/rss-accept.fixture';
import { FeedFixture } from '../../config/fixture/feed.fixture';
import { CommentFixture } from '../../config/fixture/comment.fixture';
import { UpdateCommentRequestDto } from '../../../src/comment/dto/request/updateComment.dto';
import { RssAcceptRepository } from '../../../src/rss/repository/rss.repository';
import TestAgent from 'supertest/lib/agent';
import { createAccessToken } from '../../config/e2e/env/jest.setup';
import { User } from '../../../src/user/entity/user.entity';

const URL = '/api/comment';

describe(`PATCH ${URL} E2E Test`, () => {
  let app: INestApplication;
  let agent: TestAgent;
  let comment: Comment;
  let user: User;
  let commentRepository: CommentRepository;

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
      id: requestDto.commentId,
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
    const accessToken = createAccessToken(user);

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
      id: requestDto.commentId,
    });

    // DB, Redis then
    expect(savedComment).toBeNull();
  });

  it('[401] 본인이 작성한 댓글이 아닐 경우 댓글 수정을 실패한다.', async () => {
    // given
    const requestDto = new UpdateCommentRequestDto({
      commentId: comment.id,
      newComment: 'newComment',
    });
    const accessToken = createAccessToken({ id: Number.MAX_SAFE_INTEGER });

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
      id: requestDto.commentId,
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
    const accessToken = createAccessToken(user);

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
      id: requestDto.commentId,
    });

    // DB, Redis then
    expect(savedComment.comment).toBe(requestDto.newComment);
  });
});
