import { AdminFixture } from './../../fixture/admin.fixture';
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
import * as supertest from 'supertest';
import TestAgent from 'supertest/lib/agent';
import { LikeRepository } from '../../../src/like/repository/like.repository';

describe('POST /api/like E2E Test', () => {
  let app: INestApplication;
  let userService: UserService;
  let rssAccept: RssAccept;
  let user: User;
  let feed: Feed;
  let agent: TestAgent;
  let likeRepository: LikeRepository;

  beforeAll(async () => {
    app = global.testApp;
    agent = supertest(app.getHttpServer());
    userService = app.get(UserService);
    const userRepository = app.get(UserRepository);
    const rssAcceptRepository = app.get(RssAcceptRepository);
    const feedRepository = app.get(FeedRepository);
    likeRepository = app.get(LikeRepository);

    user = await userRepository.save(
      await UserFixture.createUserCryptFixture(),
    );
    rssAccept = await rssAcceptRepository.save(
      RssAcceptFixture.createRssAcceptFixture(),
    );
    feed = await feedRepository.save(FeedFixture.createFeedFixture(rssAccept));
  });

  it('[401] 로그인이 되어 있지 않을 경우 좋아요 등록을 실패한다.', async () => {
    // given
    const requestDto = new ManageLikeRequestDto({
      feedId: feed.id,
    });

    // when
    const response = await agent.post('/api/like').send(requestDto);

    // then
    expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
  });

  it('[404] 게시글이 서비스에 존재하지 않을 경우 좋아요 등록을 실패한다.', async () => {
    // given
    const requestDto = new ManageLikeRequestDto({
      feedId: Number.MAX_SAFE_INTEGER,
    });
    const accessToken = userService.createToken(
      {
        id: user.id,
        email: user.email,
        userName: user.userName,
        role: 'user',
      },
      'access',
    );

    // when
    const response = await agent
      .post('/api/like')
      .set('Authorization', `Bearer ${accessToken}`)
      .send(requestDto);

    // then
    expect(response.status).toBe(HttpStatus.NOT_FOUND);
  });

  it('[409] 이미 좋아요를 한 게시글일 경우 좋아요 등록을 실패한다.', async () => {
    // given
    const like = await likeRepository.save({
      user: user,
      feed: feed,
    });
    const requestDto = new ManageLikeRequestDto({
      feedId: feed.id,
    });
    const accessToken = userService.createToken(
      {
        id: user.id,
        email: user.email,
        userName: user.userName,
        role: 'user',
      },
      'access',
    );

    // when
    const response = await agent
      .post('/api/like')
      .set('Authorization', `Bearer ${accessToken}`)
      .send(requestDto);

    // then
    expect(response.status).toBe(HttpStatus.CONFLICT);

    // cleanup
    await likeRepository.delete(like.id);
  });

  it('[201] 로그인이 되어 있으며 좋아요를 한 적이 없을 경우 좋아요 등록을 성공한다.', async () => {
    // given
    const requestDto = new ManageLikeRequestDto({
      feedId: feed.id,
    });
    const accessToken = userService.createToken(
      {
        id: user.id,
        email: user.email,
        userName: user.userName,
        role: 'user',
      },
      'access',
    );

    // when
    const response = await agent
      .post('/api/like')
      .set('Authorization', `Bearer ${accessToken}`)
      .send(requestDto);

    // then
    expect(response.status).toBe(HttpStatus.CREATED);

    // cleanup
    await likeRepository.delete({ user: user, feed: feed });
  });
});
