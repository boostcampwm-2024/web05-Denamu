import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
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
import { RssAcceptFixture } from '../../fixture/rssAccept.fixture';
import { RssAcceptRepository } from '../../../src/rss/repository/rss.repository';

describe('DELETE /api/comment E2E Test', () => {
  let app: INestApplication;
  let userService: UserService;
  let userInformation: User;
  let commentInformation: Comment;

  beforeAll(async () => {
    app = global.testApp;
    userService = app.get(UserService);
    const userRepository = app.get(UserRepository);
    const rssAcceptRepository = app.get(RssAcceptRepository);
    const feedRepository = app.get(FeedRepository);
    const commentRepository = app.get(CommentRepository);

    userInformation = await userRepository.save(
      await UserFixture.createUserCryptFixture(),
    );

    const rssAcceptInformation = await rssAcceptRepository.save(
      RssAcceptFixture.createRssAcceptFixture(),
    );

    const feedInformation = await feedRepository.save(
      FeedFixture.createFeedFixture(rssAcceptInformation),
    );

    commentInformation = await commentRepository.save(
      CommentFixture.createCommentFixture(feedInformation, userInformation),
    );
  });

  it('[401] 로그인이 되어 있지 않다면 댓글을 삭제할 수 없다.', async () => {
    // given
    const comment = new DeleteCommentRequestDto({
      commentId: commentInformation.id,
    });
    const agent = request.agent(app.getHttpServer());

    // when
    const response = await agent.delete('/api/comment').send(comment);

    // then
    expect(response.status).toBe(401);
  });

  it('[401] 본인이 작성한 댓글이 아니라면 댓글을 삭제할 수 없다.', async () => {
    // given
    const accessToken = userService.createToken(
      {
        id: Number.MAX_SAFE_INTEGER,
        email: userInformation.email,
        userName: userInformation.userName,
        role: 'user',
      },
      'access',
    );
    const comment = new DeleteCommentRequestDto({
      commentId: commentInformation.id,
    });
    const agent = request.agent(app.getHttpServer());

    // when
    const response = await agent
      .delete('/api/comment')
      .set('Authorization', `Bearer ${accessToken}`)
      .send(comment);

    // then
    expect(response.status).toBe(401);
  });

  it('[404] 존재하지 않는 댓글은 삭제할 수 없다.', async () => {
    // given
    const accessToken = userService.createToken(
      {
        id: userInformation.id,
        email: userInformation.email,
        userName: userInformation.userName,
        role: 'user',
      },
      'access',
    );
    const comment = new DeleteCommentRequestDto({
      commentId: Number.MAX_SAFE_INTEGER,
    });
    const agent = request.agent(app.getHttpServer());

    // when
    const response = await agent
      .delete('/api/comment')
      .set('Authorization', `Bearer ${accessToken}`)
      .send(comment);

    // then
    expect(response.status).toBe(404);
  });

  it('[200] 로그인이 되어 있다면 댓글을 삭제할 수 있다.', async () => {
    // given
    const accessToken = userService.createToken(
      {
        id: userInformation.id,
        email: userInformation.email,
        userName: userInformation.userName,
        role: 'user',
      },
      'access',
    );
    const comment = new DeleteCommentRequestDto({
      commentId: commentInformation.id,
    });
    const agent = request.agent(app.getHttpServer());

    // when
    const response = await agent
      .delete('/api/comment')
      .set('Authorization', `Bearer ${accessToken}`)
      .send(comment);

    // then
    expect(response.status).toBe(200);
  });
});
