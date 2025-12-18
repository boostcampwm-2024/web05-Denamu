import { HttpStatus, INestApplication } from '@nestjs/common';
import { UserRepository } from '../../../src/user/repository/user.repository';
import { RssAcceptRepository } from '../../../src/rss/repository/rss.repository';
import { FeedRepository } from '../../../src/feed/repository/feed.repository';
import { UserFixture } from '../../config/common/fixture/user.fixture';
import { RssAcceptFixture } from '../../config/common/fixture/rss-accept.fixture';
import { FeedFixture } from '../../config/common/fixture/feed.fixture';
import { Feed } from '../../../src/feed/entity/feed.entity';
import * as supertest from 'supertest';
import TestAgent from 'supertest/lib/agent';
import { LikeRepository } from '../../../src/like/repository/like.repository';
import { createAccessToken } from '../../config/e2e/env/jest.setup';
import { User } from '../../../src/user/entity/user.entity';
import { RssAccept } from '../../../src/rss/entity/rss.entity';
import { Like } from '../../../src/like/entity/like.entity';

const URL = '/api/like';

describe(`GET ${URL}/{feedId} E2E Test`, () => {
  let app: INestApplication;
  let agent: TestAgent;
  let feed: Feed;
  let user: User;
  let userRepository: UserRepository;
  let rssAcceptRepository: RssAcceptRepository;
  let feedRepository: FeedRepository;
  let likeRepository: LikeRepository;
  let rssAccept: RssAccept;
  let like: Like;

  beforeAll(async () => {
    app = global.testApp;
    agent = supertest(app.getHttpServer());
    userRepository = app.get(UserRepository);
    rssAcceptRepository = app.get(RssAcceptRepository);
    feedRepository = app.get(FeedRepository);
    likeRepository = app.get(LikeRepository);
  });

  beforeEach(async () => {
    rssAccept = await rssAcceptRepository.save(
      RssAcceptFixture.createRssAcceptFixture(),
    );
    user = await userRepository.save(
      await UserFixture.createUserCryptFixture(),
    );
    feed = await feedRepository.save(FeedFixture.createFeedFixture(rssAccept));
    like = await likeRepository.save({ user, feed });
  });

  afterEach(async () => {
    await likeRepository.delete(like.id);
    await feedRepository.delete(feed.id);
    await userRepository.delete(user.id);
    await rssAcceptRepository.delete(rssAccept.id);
  });

  it('[404] 게시글이 존재하지 않을 경우 좋아요 정보 제공을 실패한다.', async () => {
    // Http when
    const response = await agent.get(`${URL}/${Number.MAX_SAFE_INTEGER}`);

    // Http then
    const { data } = response.body;
    expect(response.status).toBe(HttpStatus.NOT_FOUND);
    expect(data).toBeUndefined();
  });

  it('[200] 로그인하지 않은 상황에서 게시글에 대한 좋아요 조회 요청을 받을 경우 좋아요 정보 제공을 성공한다.', async () => {
    // Http when
    const response = await agent.get(`${URL}/${feed.id}`);

    // Http then
    const { data } = response.body;
    expect(response.status).toBe(HttpStatus.OK);
    expect(data).toStrictEqual({
      isLike: false,
    });
  });

  it('[200] 로그인한 상황에서 게시글에 대한 좋아요 조회 요청을 받을 경우 좋아요 정보 제공을 성공한다.', async () => {
    // given
    const accessToken = createAccessToken(user);

    // Http when
    const response = await agent
      .get(`${URL}/${feed.id}`)
      .set('Authorization', `Bearer ${accessToken}`);

    // Http then
    const { data } = response.body;
    expect(response.status).toBe(HttpStatus.OK);
    expect(data).toStrictEqual({
      isLike: true,
    });
  });
});
