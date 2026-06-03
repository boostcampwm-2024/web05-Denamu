import { HttpStatus } from '@nestjs/common';

import supertest from 'supertest';
import TestAgent from 'supertest/lib/agent';

import { Feed } from '@feed/entity/feed.entity';
import { FeedRepository } from '@feed/repository/feed.repository';

import { LikeRepository } from '@like/repository/like.repository';

import { RssAccept } from '@rss/entity/rss.entity';
import { RssAcceptRepository } from '@rss/repository/rss.repository';

import { User } from '@user/entity/user.entity';
import { UserRepository } from '@user/repository/user.repository';

import { FeedFixture } from '@test/config/common/fixture/feed.fixture';
import { RssAcceptFixture } from '@test/config/common/fixture/rss-accept.fixture';
import { UserFixture } from '@test/config/common/fixture/user.fixture';
import { createAccessToken } from '@test/config/e2e/env/jest.setup';
import { testApp } from '@test/config/e2e/env/jest.setup';

const BASE_URL = '/api/feeds';

describe(`POST ${BASE_URL}/:feedId/likes E2E Test`, () => {
  let user: User;
  let feed: Feed;
  let agent: TestAgent;
  let likeRepository: LikeRepository;
  let userRepository: UserRepository;
  let rssAcceptRepository: RssAcceptRepository;
  let feedRepository: FeedRepository;
  let rssAccept: RssAccept;
  let accessToken: string;

  beforeAll(() => {
    agent = supertest(testApp.getHttpServer());
    userRepository = testApp.get(UserRepository);
    rssAcceptRepository = testApp.get(RssAcceptRepository);
    feedRepository = testApp.get(FeedRepository);
    likeRepository = testApp.get(LikeRepository);
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

  it('[401] 로그인이 되어 있지 않을 경우 좋아요 등록을 실패한다.', async () => {
    // Http when
    const response = await agent.post(`${BASE_URL}/${feed.id}/likes`);

    // Http then
    const { data } = response.body;
    expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
    expect(data).toBeUndefined();

    // DB, Redis when
    const savedLike = await likeRepository.findOneBy({
      feed: { id: feed.id },
      user: { id: user.id },
    });

    // DB, Redis then
    expect(savedLike).toBeNull();
  });

  it('[404] 게시글이 서비스에 존재하지 않을 경우 좋아요 등록을 실패한다.', async () => {
    // Http when
    const response = await agent
      .post(`${BASE_URL}/${Number.MAX_SAFE_INTEGER}/likes`)
      .set('Authorization', `Bearer ${accessToken}`);

    // Http then
    const { data } = response.body;
    expect(response.status).toBe(HttpStatus.NOT_FOUND);
    expect(data).toBeUndefined();

    // DB, Redis when
    const savedLike = await likeRepository.findOneBy({
      feed: { id: feed.id },
      user: { id: user.id },
    });

    // DB, Redis then
    expect(savedLike).toBeNull();
  });

  it('[404] 유저 정보가 존재하지 않을 경우 좋아요 등록을 실패한다.', async () => {
    // given
    accessToken = createAccessToken({ id: Number.MAX_SAFE_INTEGER });

    // Http when
    const response = await agent
      .post(`${BASE_URL}/${Number.MAX_SAFE_INTEGER}/likes`)
      .set('Authorization', `Bearer ${accessToken}`);

    // Http then
    const { data } = response.body;
    expect(response.status).toBe(HttpStatus.NOT_FOUND);
    expect(data).toBeUndefined();

    // DB, Redis when
    const savedLike = await likeRepository.findOneBy({
      feed: { id: feed.id },
      user: { id: Number.MAX_SAFE_INTEGER },
    });

    // DB, Redis then
    expect(savedLike).toBeNull();
  });

  it('[409] 이미 좋아요를 한 게시글일 경우 좋아요 등록을 실패한다.', async () => {
    // given
    await likeRepository.insert({ user, feed });

    // Http when
    const response = await agent
      .post(`${BASE_URL}/${feed.id}/likes`)
      .set('Authorization', `Bearer ${accessToken}`);

    // Http then
    const { data } = response.body;
    expect(response.status).toBe(HttpStatus.CONFLICT);
    expect(data).toBeUndefined();

    // DB, Redis when
    const savedLike = await likeRepository.findBy({
      feed: { id: feed.id },
      user: { id: user.id },
    });

    // DB, Redis then
    expect(savedLike.length).toBe(1);
  });

  it('[201] 로그인이 되어 있으며 좋아요를 한 적이 없을 경우 좋아요 등록을 성공한다.', async () => {
    // Http when
    const response = await agent
      .post(`${BASE_URL}/${feed.id}/likes`)
      .set('Authorization', `Bearer ${accessToken}`);

    // Http then
    const { data } = response.body;
    expect(response.status).toBe(HttpStatus.CREATED);
    expect(data).toBeUndefined();

    // DB, Redis when
    const savedLike = await likeRepository.findOneBy({
      feed: { id: feed.id },
      user: { id: user.id },
    });

    // DB, Redis then
    expect(savedLike).not.toBeNull();
  });
});
