import { HttpStatus, INestApplication } from '@nestjs/common';
import * as supertest from 'supertest';
import { UserRepository } from '../../../src/user/repository/user.repository';
import { UserFixture } from '../../fixture/user.fixture';
import { User } from '../../../src/user/entity/user.entity';
import { CreateCommentRequestDto } from '../../../src/comment/dto/request/createComment.dto';
import { FeedRepository } from '../../../src/feed/repository/feed.repository';
import { Feed } from '../../../src/feed/entity/feed.entity';
import { FeedFixture } from '../../fixture/feed.fixture';
import { RssAcceptFixture } from '../../fixture/rss-accept.fixture';
import { RssAcceptRepository } from '../../../src/rss/repository/rss.repository';
import TestAgent from 'supertest/lib/agent';
import { CommentRepository } from '../../../src/comment/repository/comment.repository';
import { CommentFixture } from '../../fixture/comment.fixture';
import { createAccessToken } from '../../config/e2e/env/jest.setup';

const URL = '/api/comment';

describe(`POST ${URL} E2E Test`, () => {
  let app: INestApplication;
  let agent: TestAgent;
  let user: User;
  let feed: Feed;
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
    [user, feed] = await Promise.all([
      userRepository.save(await UserFixture.createUserCryptFixture()),
      feedRepository.save(FeedFixture.createFeedFixture(rssAccept)),
    ]);
  });

  it('[401] 로그인이 되어 있지 않을 경우 댓글 등록을 실패한다.', async () => {
    // given
    const requestDto = new CreateCommentRequestDto({
      comment: CommentFixture.GENERAL_COMMENT.comment,
      feedId: feed.id,
    });

    // Http when
    const response = await agent.post(URL).send(requestDto);

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
    const accessToken = createAccessToken(user);
    const requestDto = new CreateCommentRequestDto({
      comment: CommentFixture.GENERAL_COMMENT.comment,
      feedId: Number.MAX_SAFE_INTEGER,
    });

    // Http when
    const response = await agent
      .post(URL)
      .set('Authorization', `Bearer ${accessToken}`)
      .send(requestDto);

    // Http then
    const { data } = response.body;
    expect(response.status).toBe(HttpStatus.NOT_FOUND);
    expect(data).toBeUndefined();

    // DB, Redis when
    const savedComment = await commentRepository.findOneBy({
      comment: requestDto.comment,
      feed: { id: requestDto.feedId },
    });

    // DB, Redis then
    expect(savedComment).toBeNull();
  });

  it('[404] 회원 정보가 없을 경우 댓글 등록을 실패한다.', async () => {
    // given
    const accessToken = createAccessToken({ id: Number.MAX_SAFE_INTEGER });
    const requestDto = new CreateCommentRequestDto({
      comment: CommentFixture.GENERAL_COMMENT.comment,
      feedId: feed.id,
    });

    // Http when
    const response = await agent
      .post(URL)
      .set('Authorization', `Bearer ${accessToken}`)
      .send(requestDto);

    // Http then
    const { data } = response.body;
    expect(response.status).toBe(HttpStatus.NOT_FOUND);
    expect(data).toBeUndefined();

    // DB, Redis when
    const savedComment = await commentRepository.findOneBy({
      comment: requestDto.comment,
      feed: { id: feed.id },
    });

    // DB, Redis then
    expect(savedComment).toBeNull();
  });

  it('[201] 로그인이 되어 있을 경우 댓글 등록을 성공한다.', async () => {
    // given
    const accessToken = createAccessToken(user);
    const requestDto = new CreateCommentRequestDto({
      comment: CommentFixture.GENERAL_COMMENT.comment,
      feedId: feed.id,
    });

    // Http when
    const response = await agent
      .post(URL)
      .set('Authorization', `Bearer ${accessToken}`)
      .send(requestDto);

    // Http then
    const { data } = response.body;
    expect(response.status).toBe(HttpStatus.CREATED);
    expect(data).toBeUndefined();

    // DB, Redis when
    const savedComment = await commentRepository.findOneBy({
      feed: { id: requestDto.feedId },
      user: { id: user.id },
    });

    // DB, Redis then
    expect(savedComment).not.toBeNull();

    // cleanup
    await commentRepository.delete({ user, feed });
  });
});
