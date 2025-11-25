import { HttpStatus, INestApplication } from '@nestjs/common';
import * as supertest from 'supertest';
import { UserService } from '../../../src/user/service/user.service';
import { UserRepository } from '../../../src/user/repository/user.repository';
import { UserFixture } from '../../fixture/user.fixture';
import { User } from '../../../src/user/entity/user.entity';
import { DeleteCommentRequestDto } from '../../../src/comment/dto/request/deleteComment.dto';
import { Comment } from '../../../src/comment/entity/comment.entity';
import { CommentRepository } from '../../../src/comment/repository/comment.repository';
import { CommentFixture } from '../../fixture/comment.fixture';
import { FeedRepository } from '../../../src/feed/repository/feed.repository';
import { FeedFixture } from '../../fixture/feed.fixture';
import { RssAcceptFixture } from '../../fixture/rss-accept.fixture';
import { RssAcceptRepository } from '../../../src/rss/repository/rss.repository';
import TestAgent from 'supertest/lib/agent';

const URL = '/api/comment';

describe(`DELETE ${URL} E2E Test`, () => {
  let app: INestApplication;
  let agent: TestAgent;
  let userService: UserService;
  let user: User;
  let comment: Comment;

  beforeAll(async () => {
    app = global.testApp;
    agent = supertest(app.getHttpServer());
    userService = app.get(UserService);
    const userRepository = app.get(UserRepository);
    const rssAcceptRepository = app.get(RssAcceptRepository);
    const feedRepository = app.get(FeedRepository);
    const commentRepository = app.get(CommentRepository);

    user = await userRepository.save(
      await UserFixture.createUserCryptFixture(),
    );

    const rssAcceptInformation = await rssAcceptRepository.save(
      RssAcceptFixture.createRssAcceptFixture(),
    );

    const feedInformation = await feedRepository.save(
      FeedFixture.createFeedFixture(rssAcceptInformation),
    );

    comment = await commentRepository.save(
      CommentFixture.createCommentFixture(feedInformation, user),
    );
  });

  it('[401] 로그인이 되어 있지 않을 경우 댓글 삭제를 실패한다.', async () => {
    // given
    const requestDto = new DeleteCommentRequestDto({
      commentId: comment.id,
    });

    // when
    const response = await agent.delete(URL).send(requestDto);

    // then
    expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
  });

  it('[404] 삭제하고자 하는 댓글이 존재하지 않을 경우 댓글 삭제를 실패한다.', async () => {
    // given
    const accessToken = userService.createToken(
      {
        id: user.id,
        email: user.email,
        userName: user.userName,
        role: 'user',
      },
      'access',
    );
    const requestDto = new DeleteCommentRequestDto({
      commentId: Number.MAX_SAFE_INTEGER,
    });

    // when
    const response = await agent
      .delete(URL)
      .set('Authorization', `Bearer ${accessToken}`)
      .send(requestDto);

    // then
    expect(response.status).toBe(HttpStatus.NOT_FOUND);
  });

  it('[401] 본인이 작성한 댓글이 아닐 경우 댓글 삭제를 실패한다.', async () => {
    // given
    const accessToken = userService.createToken(
      {
        id: Number.MAX_SAFE_INTEGER,
        email: user.email,
        userName: user.userName,
        role: 'user',
      },
      'access',
    );
    const requestDto = new DeleteCommentRequestDto({
      commentId: comment.id,
    });

    // when
    const response = await agent
      .delete(URL)
      .set('Authorization', `Bearer ${accessToken}`)
      .send(requestDto);

    // then
    expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
  });

  it('[200] 본인이 작성한 댓글일 경우 댓글 삭제를 성공한다.', async () => {
    // given
    const accessToken = userService.createToken(
      {
        id: user.id,
        email: user.email,
        userName: user.userName,
        role: 'user',
      },
      'access',
    );
    const requestDto = new DeleteCommentRequestDto({
      commentId: comment.id,
    });

    // when
    const response = await agent
      .delete(URL)
      .set('Authorization', `Bearer ${accessToken}`)
      .send(requestDto);

    // then
    expect(response.status).toBe(HttpStatus.OK);
  });
});
