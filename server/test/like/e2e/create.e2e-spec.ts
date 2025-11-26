import { HttpStatus, INestApplication } from '@nestjs/common';
import { UserService } from '../../../src/user/service/user.service';
import { UserRepository } from '../../../src/user/repository/user.repository';
import { RssAcceptRepository } from '../../../src/rss/repository/rss.repository';
import { FeedRepository } from '../../../src/feed/repository/feed.repository';
import { UserFixture } from '../../fixture/user.fixture';
import { RssAcceptFixture } from '../../fixture/rss-accept.fixture';
import { FeedFixture } from '../../fixture/feed.fixture';
import { User } from '../../../src/user/entity/user.entity';
import { Feed } from '../../../src/feed/entity/feed.entity';
import { ManageLikeRequestDto } from '../../../src/like/dto/request/manageLike.dto';
import * as supertest from 'supertest';
import TestAgent from 'supertest/lib/agent';
import { LikeRepository } from '../../../src/like/repository/like.repository';

const URL = '/api/like';

describe(`POST ${URL} E2E Test`, () => {
  let app: INestApplication;
  let user: User;
  let feed: Feed;
  let agent: TestAgent;
  let likeRepository: LikeRepository;
  let createAccessToken: (arg0?: number) => string;

  beforeAll(async () => {
    app = global.testApp;
    agent = supertest(app.getHttpServer());
    const userService = app.get(UserService);
    const userRepository = app.get(UserRepository);
    const rssAcceptRepository = app.get(RssAcceptRepository);
    const feedRepository = app.get(FeedRepository);
    const rssAccept = await rssAcceptRepository.save(
      RssAcceptFixture.createRssAcceptFixture(),
    );
    likeRepository = app.get(LikeRepository);
    [user, feed] = await Promise.all([
      userRepository.save(await UserFixture.createUserCryptFixture()),
      feedRepository.save(FeedFixture.createFeedFixture(rssAccept)),
    ]);
    createAccessToken = (notFoundId?: number) =>
      userService.createToken(
        {
          id: notFoundId ?? user.id,
          email: user.email,
          userName: user.userName,
          role: 'user',
        },
        'access',
      );
  });

  it('[401] 로그인이 되어 있지 않을 경우 좋아요 등록을 실패한다.', async () => {
    // given
    const requestDto = new ManageLikeRequestDto({
      feedId: feed.id,
    });

    // when
    const response = await agent.post(URL).send(requestDto);

    // then
    const { data } = response.body;
    expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
    expect(data).toBeUndefined();
  });

  it('[404] 게시글이 서비스에 존재하지 않을 경우 좋아요 등록을 실패한다.', async () => {
    // given
    const requestDto = new ManageLikeRequestDto({
      feedId: Number.MAX_SAFE_INTEGER,
    });
    const accessToken = createAccessToken();

    // when
    const response = await agent
      .post(URL)
      .set('Authorization', `Bearer ${accessToken}`)
      .send(requestDto);

    // then
    const { data } = response.body;
    expect(response.status).toBe(HttpStatus.NOT_FOUND);
    expect(data).toBeUndefined();
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
    const accessToken = createAccessToken();

    // when
    const response = await agent
      .post(URL)
      .set('Authorization', `Bearer ${accessToken}`)
      .send(requestDto);

    // then
    const { data } = response.body;
    expect(response.status).toBe(HttpStatus.CONFLICT);
    expect(data).toBeUndefined();

    // cleanup
    await likeRepository.delete(like.id);
  });

  it('[201] 로그인이 되어 있으며 좋아요를 한 적이 없을 경우 좋아요 등록을 성공한다.', async () => {
    // given
    const requestDto = new ManageLikeRequestDto({
      feedId: feed.id,
    });
    const accessToken = createAccessToken();

    // when
    const response = await agent
      .post(URL)
      .set('Authorization', `Bearer ${accessToken}`)
      .send(requestDto);

    // then
    const { data } = response.body;
    expect(response.status).toBe(HttpStatus.CREATED);
    expect(data).toBeUndefined();

    // cleanup
    await likeRepository.delete({ user: user, feed: feed });
  });
});
