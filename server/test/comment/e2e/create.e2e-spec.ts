import { HttpStatus, INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { UserService } from '../../../src/user/service/user.service';
import { UserRepository } from '../../../src/user/repository/user.repository';
import { UserFixture } from '../../fixture/user.fixture';
import { User } from '../../../src/user/entity/user.entity';
import { CreateCommentRequestDto } from '../../../src/comment/dto/request/createComment.dto';
import { FeedRepository } from '../../../src/feed/repository/feed.repository';
import { Feed } from '../../../src/feed/entity/feed.entity';
import { FeedFixture } from '../../fixture/feed.fixture';
import { RssAcceptFixture } from '../../fixture/rssAccept.fixture';
import { RssAcceptRepository } from '../../../src/rss/repository/rss.repository';

describe('POST /api/comment E2E Test', () => {
  let app: INestApplication;
  let userService: UserService;
  let userInformation: User;
  let feed: Feed;

  beforeAll(async () => {
    app = global.testApp;
    userService = app.get(UserService);
    const userRepository = app.get(UserRepository);
    const rssAcceptRepository = app.get(RssAcceptRepository);
    const feedRepository = app.get(FeedRepository);

    userInformation = await userRepository.save(
      await UserFixture.createUserCryptFixture(),
    );
    const rssAcceptInformation = await rssAcceptRepository.save(
      RssAcceptFixture.createRssAcceptFixture(),
    );
    feed = await feedRepository.save(
      FeedFixture.createFeedFixture(rssAcceptInformation),
    );
  });

  it('[401] 로그인이 되어 있지 않다면 댓글을 등록할 수 없다.', async () => {
    // given
    const comment = new CreateCommentRequestDto({
      comment: 'test',
      feedId: feed.id,
    });
    const agent = request.agent(app.getHttpServer());

    // when
    const response = await agent.post('/api/comment').send(comment);

    // then
    expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
  });

  it('[404] 계정 정보가 존재하지 않으면 댓글을 등록할 수 없다.', async () => {
    // given
    const comment = new CreateCommentRequestDto({
      comment: 'test',
      feedId: feed.id,
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
      .post('/api/comment')
      .set('Authorization', `Bearer ${accessToken}`)
      .send(comment);

    // then
    expect(response.status).toBe(HttpStatus.NOT_FOUND);
  });

  it('[404] 게시글이 존재하지 않으면 댓글을 등록할 수 없다.', async () => {
    // given
    const comment = new CreateCommentRequestDto({
      comment: 'test',
      feedId: 400,
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
      .post('/api/comment')
      .set('Authorization', `Bearer ${accessToken}`)
      .send(comment);

    // then
    expect(response.status).toBe(HttpStatus.NOT_FOUND);
  });

  it('[201] 로그인이 되어 있다면 댓글을 등록할 수 있다.', async () => {
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
    const comment = new CreateCommentRequestDto({
      comment: 'test',
      feedId: feed.id,
    });
    const agent = request.agent(app.getHttpServer());

    // when
    const response = await agent
      .post('/api/comment')
      .set('Authorization', `Bearer ${accessToken}`)
      .send(comment);

    // then
    expect(response.status).toBe(HttpStatus.CREATED);
  });
});
