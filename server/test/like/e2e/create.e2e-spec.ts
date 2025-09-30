import { HttpStatus, INestApplication } from '@nestjs/common';
import { UserService } from '../../../src/user/service/user.service';
import { UserRepository } from '../../../src/user/repository/user.repository';
import { RssAcceptRepository } from '../../../src/rss/repository/rss.repository';
import { FeedRepository } from '../../../src/feed/repository/feed.repository';
import { UserFixture } from '../../fixture/user.fixture';
import { RssAcceptFixture } from '../../fixture/rss-accept.fixture';
import { FeedFixture } from '../../fixture/feed.fixture';
import { RssAccept } from '../../../src/rss/entity/rss.entity';
import { User } from '../../../src/user/entity/user.entity';
import { Feed } from '../../../src/feed/entity/feed.entity';
import { ManageLikeRequestDto } from '../../../src/like/dto/request/manageLike.dto';
import * as request from 'supertest';

describe('POST /api/like E2E Test', () => {
  let app: INestApplication;
  let userService: UserService;
  let rssAcceptInformation: RssAccept;
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
    rssAcceptInformation = await rssAcceptRepository.save(
      RssAcceptFixture.createRssAcceptFixture(),
    );
    feed = await feedRepository.save(
      FeedFixture.createFeedFixture(rssAcceptInformation),
    );
  });

  it('[401] 로그인이 되어 있지 않다면 좋아요 등록을 할 수 없다.', async () => {
    // given
    const feedLikeRequest = new ManageLikeRequestDto({
      feedId: 1,
    });
    const agent = request.agent(app.getHttpServer());

    // when
    const response = await agent.post('/api/like').send(feedLikeRequest);

    // then
    expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
  });

  it('[404] 게시글이 존재하지 않다면 좋아요를 등록할 수 없다.', async () => {
    // given
    const feedLikeRequest = new ManageLikeRequestDto({
      feedId: 100,
    });
    const accessToken = userService.createToken(
      {
        id: 1,
        email: userInformation.email,
        userName: userInformation.userName,
        role: 'user',
      },
      'access',
    );
    const agent = request.agent(app.getHttpServer());

    // when
    const response = await agent
      .post('/api/like')
      .set('Authorization', `Bearer ${accessToken}`)
      .send(feedLikeRequest);

    // then
    expect(response.status).toBe(HttpStatus.NOT_FOUND);
  });

  it('[201] 로그인이 되어있고 좋아요를 하지 않았다면 좋아요를 등록할 수 있다.', async () => {
    // given
    const feedLikeRequest = new ManageLikeRequestDto({
      feedId: 1,
    });
    const accessToken = userService.createToken(
      {
        id: 1,
        email: userInformation.email,
        userName: userInformation.userName,
        role: 'user',
      },
      'access',
    );
    const agent = request.agent(app.getHttpServer());

    // when
    const response = await agent
      .post('/api/like')
      .set('Authorization', `Bearer ${accessToken}`)
      .send(feedLikeRequest);

    // then
    expect(response.status).toBe(HttpStatus.CREATED);
  });

  it('[409] 이미 좋아요를 했다면 좋아요를 등록할 수 없다.', async () => {
    // given
    const feedLikeRequest = new ManageLikeRequestDto({
      feedId: 1,
    });
    const accessToken = userService.createToken(
      {
        id: 1,
        email: userInformation.email,
        userName: userInformation.userName,
        role: 'user',
      },
      'access',
    );
    const agent = request.agent(app.getHttpServer());

    // when
    const response = await agent
      .post('/api/like')
      .set('Authorization', `Bearer ${accessToken}`)
      .send(feedLikeRequest);

    // then
    expect(response.status).toBe(HttpStatus.CONFLICT);
  });
});
