import { HttpStatus, INestApplication } from '@nestjs/common';
import { UserRepository } from '../../../src/user/repository/user.repository';
import { RssAcceptRepository } from '../../../src/rss/repository/rss.repository';
import { FeedRepository } from '../../../src/feed/repository/feed.repository';
import { UserFixture } from '../../fixture/user.fixture';
import { RssAcceptFixture } from '../../fixture/rss-accept.fixture';
import { FeedFixture } from '../../fixture/feed.fixture';
import { Feed } from '../../../src/feed/entity/feed.entity';
import * as supertest from 'supertest';
import TestAgent from 'supertest/lib/agent';
import { UserService } from '../../../src/user/service/user.service';
import { LikeRepository } from '../../../src/like/repository/like.repository';

const URL = '/api/like';

describe(`GET ${URL}/{feedId} E2E Test`, () => {
  let app: INestApplication;
  let agent: TestAgent;
  let feed: Feed;
  let createAccessToken: (arg0?: number) => string;

  beforeAll(async () => {
    app = global.testApp;
    agent = supertest(app.getHttpServer());
    const userService = app.get(UserService);
    const userRepository = app.get(UserRepository);
    const rssAcceptRepository = app.get(RssAcceptRepository);
    const feedRepository = app.get(FeedRepository);
    const likeRepository = app.get(LikeRepository);
    const rssAccept = await rssAcceptRepository.save(
      RssAcceptFixture.createRssAcceptFixture(),
    );
    const user = await userRepository.save(
      await UserFixture.createUserCryptFixture(),
    );
    feed = await feedRepository.save(FeedFixture.createFeedFixture(rssAccept));
    await likeRepository.insert({ user, feed });

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

  it('[404] 게시글이 존재하지 않을 경우 좋아요 정보 제공을 실패한다.', async () => {
    // when
    const response = await agent.get(`${URL}/${Number.MAX_SAFE_INTEGER}`);

    // then
    const { data } = response.body;
    expect(response.status).toBe(HttpStatus.NOT_FOUND);
    expect(data).toBeUndefined();
  });

  it('[200] 로그인하지 않은 상황에서 게시글에 대한 좋아요 조회 요청을 받을 경우 좋아요 정보 제공을 성공한다.', async () => {
    // when
    const response = await agent.get(`${URL}/${feed.id}`);

    // then
    const { data } = response.body;
    expect(response.status).toBe(HttpStatus.OK);
    expect(data).toStrictEqual({
      isLike: false,
    });
  });

  it('[200] 로그인한 상황에서 게시글에 대한 좋아요 조회 요청을 받을 경우 좋아요 정보 제공을 성공한다.', async () => {
    // given
    const accessToken = createAccessToken();

    // when
    const response = await agent
      .get(`${URL}/${feed.id}`)
      .set('Authorization', `Bearer ${accessToken}`);

    // then
    const { data } = response.body;
    expect(response.status).toBe(HttpStatus.OK);
    expect(data).toStrictEqual({
      isLike: true,
    });
  });
});
