import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { UserService } from '../../../src/user/service/user.service';
import { UserRepository } from '../../../src/user/repository/user.repository';
import { UserFixture } from '../../fixture/user.fixture';
import { User } from '../../../src/user/entity/user.entity';
import { Feed } from '../../../src/feed/entity/feed.entity';
import { Comment } from '../../../src/comment/entity/comment.entity';
import { FeedRepository } from '../../../src/feed/repository/feed.repository';
import { CommentRepository } from '../../../src/comment/repository/comment.repository';
import { RssAcceptFixture } from '../../fixture/rssAccept.fixture';
import { FeedFixture } from '../../fixture/feed.fixture';
import { CommentFixture } from '../../fixture/comment.fixture';
import { UpdateCommentRequestDto } from '../../../src/comment/dto/request/updateComment.dto';
import { RssAcceptRepository } from '../../../src/rss/repository/rss.repository';
import { RssAccept } from '../../../src/rss/entity/rss.entity';

describe('POST /api/comment E2E Test', () => {
  let app: INestApplication;
  let userService: UserService;
  let userInformation: User;
  let rssAcceptInformation: RssAccept;
  let feedInformation: Feed;
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

    rssAcceptInformation = await rssAcceptRepository.save(
      RssAcceptFixture.createRssAcceptFixture(),
    );

    feedInformation = await feedRepository.save(
      FeedFixture.createFeedFixture(rssAcceptInformation),
    );

    commentInformation = await commentRepository.save(
      CommentFixture.createCommentFixture(feedInformation, userInformation),
    );
  });

  it('로그인이 되어 있지 않다면 댓글을 수정할 수 없다.', async () => {
    // given
    const comment = new UpdateCommentRequestDto({
      commentId: commentInformation.id,
      newComment: 'newComment',
    });
    const agent = request.agent(app.getHttpServer());

    // when
    const response = await agent.patch('/api/comment').send(comment);

    // then
    expect(response.status).toBe(401);
  });

  it('본인이 작성한 댓글이 아니라면 댓글을 수정할 수 없다.', async () => {
    // given
    const comment = new UpdateCommentRequestDto({
      commentId: commentInformation.id,
      newComment: 'newComment',
    });
    const accessToken = userService.createToken(
      {
        id: 400,
        email: userInformation.email,
        userName: userInformation.userName,
        role: 'user',
      },
      'access',
    );
    const agent = request.agent(app.getHttpServer());

    // when
    const response = await agent
      .patch('/api/comment')
      .set('Authorization', `Bearer ${accessToken}`)
      .send(comment);

    // then
    expect(response.status).toBe(401);
  });

  it('존재하지 않는 댓글은 수정할 수 없다.', async () => {
    // given
    const comment = new UpdateCommentRequestDto({
      commentId: 400,
      newComment: 'newComment',
    });
    const accessToken = userService.createToken(
      {
        id: userInformation.id,
        email: userInformation.email,
        userName: userInformation.userName,
        role: 'user',
      },
      'access',
    );
    const agent = request.agent(app.getHttpServer());

    // when
    const response = await agent
      .patch('/api/comment')
      .set('Authorization', `Bearer ${accessToken}`)
      .send(comment);

    // then
    expect(response.status).toBe(404);
  });

  it('로그인이 되어 있다면 댓글을 수정할 수 있다.', async () => {
    // given
    const comment = new UpdateCommentRequestDto({
      commentId: commentInformation.id,
      newComment: 'newComment',
    });
    const accessToken = userService.createToken(
      {
        id: userInformation.id,
        email: userInformation.email,
        userName: userInformation.userName,
        role: 'user',
      },
      'access',
    );
    const agent = request.agent(app.getHttpServer());

    // when
    const response = await agent
      .patch('/api/comment')
      .set('Authorization', `Bearer ${accessToken}`)
      .send(comment);

    // then
    expect(response.status).toBe(200);
  });
});
