import { HttpStatus, INestApplication } from '@nestjs/common';
import * as supertest from 'supertest';
import { UserRepository } from '../../../src/user/repository/user.repository';
import { UserFixture } from '../../config/common/fixture/user.fixture';
import { User } from '../../../src/user/entity/user.entity';
import { CreateCommentRequestDto } from '../../../src/comment/dto/request/createComment.dto';
import { FeedRepository } from '../../../src/feed/repository/feed.repository';
import { Feed } from '../../../src/feed/entity/feed.entity';
import { FeedFixture } from '../../config/common/fixture/feed.fixture';
import { RssAcceptFixture } from '../../config/common/fixture/rss-accept.fixture';
import { RssAcceptRepository } from '../../../src/rss/repository/rss.repository';
import TestAgent from 'supertest/lib/agent';
import { CommentRepository } from '../../../src/comment/repository/comment.repository';
import { COMMENT_DEFAULT_TEXT } from '../../config/common/fixture/comment.fixture';
import { createAccessToken } from '../../config/e2e/env/jest.setup';
import { RssAccept } from '../../../src/rss/entity/rss.entity';

const URL = '/api/comment';

describe(`POST ${URL} E2E Test`, () => {
  let app: INestApplication;
  let agent: TestAgent;
  let user: User;
  let feed: Feed;
  let rssAccept: RssAccept;
  let commentRepository: CommentRepository;
  let rssAcceptRepository: RssAcceptRepository;
  let userRepository: UserRepository;
  let feedRepository: FeedRepository;
  let accessToken: string;

  beforeAll(async () => {
    app = global.testApp;
    agent = supertest(app.getHttpServer());
    commentRepository = app.get(CommentRepository);
    userRepository = app.get(UserRepository);
    rssAcceptRepository = app.get(RssAcceptRepository);
    feedRepository = app.get(FeedRepository);
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

  afterEach(async () => {
    await Promise.all([
      feedRepository.delete(feed.id),
      userRepository.delete(user.id),
    ]);
    await rssAcceptRepository.delete(rssAccept.id);
  });

  it('[401] 로그인이 되어 있지 않을 경우 댓글 등록을 실패한다.', async () => {
    // given
    const requestDto = new CreateCommentRequestDto({
      comment: COMMENT_DEFAULT_TEXT,
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
    const requestDto = new CreateCommentRequestDto({
      comment: COMMENT_DEFAULT_TEXT,
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
    accessToken = createAccessToken({ id: Number.MAX_SAFE_INTEGER });
    const requestDto = new CreateCommentRequestDto({
      comment: COMMENT_DEFAULT_TEXT,
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
    const requestDto = new CreateCommentRequestDto({
      comment: COMMENT_DEFAULT_TEXT,
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
    await commentRepository.delete(savedComment.id);
  });
});
