import { HttpStatus } from '@nestjs/common';

import supertest from 'supertest';
import TestAgent from 'supertest/lib/agent';

import { Activity } from '@activity/entity/activity.entity';
import { ActivityRepository } from '@activity/repository/activity.repository';

import { RedisService } from '@common/redis/redis.service';

import { RssBlockRepository } from '@block/repository/rssBlock.repository';

import { ManageFeedRequestDto } from '@feed/dto/request/manageFeed.dto';
import { Feed } from '@feed/entity/feed.entity';
import { FeedRepository } from '@feed/repository/feed.repository';

import { RssAccept } from '@rss/entity/rss.entity';
import { RssAcceptRepository } from '@rss/repository/rss.repository';

import { Tag } from '@tag/entity/tag.entity';
import { TagRepository } from '@tag/repository/tag.repository';

import { User } from '@user/entity/user.entity';
import { UserRepository } from '@user/repository/user.repository';

import { FeedFixture } from '@test/config/common/fixture/feed.fixture';
import { RssAcceptFixture } from '@test/config/common/fixture/rss-accept.fixture';
import { TagFixture } from '@test/config/common/fixture/tag.fixture';
import { UserFixture } from '@test/config/common/fixture/user.fixture';
import { createAccessToken, testApp } from '@test/config/e2e/env/jest.setup';

const URL = '/api/feeds';

describe(`GET ${URL}/{feedId} E2E Test`, () => {
  let agent: TestAgent;
  let feedList: Feed[];
  let rssAccept: RssAccept;
  let tag: Tag;
  let feedRepository: FeedRepository;
  let rssAcceptRepository: RssAcceptRepository;
  let tagRepository: TagRepository;

  beforeAll(() => {
    agent = supertest(testApp.getHttpServer());
    feedRepository = testApp.get(FeedRepository);
    rssAcceptRepository = testApp.get(RssAcceptRepository);
    tagRepository = testApp.get(TagRepository);
  });

  beforeEach(async () => {
    rssAccept = await rssAcceptRepository.save(
      RssAcceptFixture.createRssAcceptFixture(),
    );

    const feeds = Array.from({ length: 2 }).map(() =>
      FeedFixture.createFeedFixture(rssAccept),
    );
    tag = await tagRepository.save(TagFixture.createTagFixture());
    feeds[0].tags = [tag];

    feedList = await feedRepository.save(feeds);
  });

  it('[404] 존재하지 않는 피드 ID로 요청할 경우 게시글 상세 조회에 실패한다.', async () => {
    // given
    const feedDetailRequestDto = new ManageFeedRequestDto({
      feedId: Number.MAX_SAFE_INTEGER,
    });

    // Http when
    const response = await agent.get(`${URL}/${feedDetailRequestDto.feedId}`);

    // Http then
    const { data } = response.body;
    expect(response.status).toBe(HttpStatus.NOT_FOUND);
    expect(data).toBeUndefined();
  });

  it('[200] 존재하는 피드 ID로 요청할 경우 게시글 상세 조회에 성공한다.', async () => {
    // given
    const feedDetailRequestDto = new ManageFeedRequestDto({
      feedId: feedList[0].id,
    });

    // Http when
    const response = await agent.get(`${URL}/${feedDetailRequestDto.feedId}`);

    // Http then
    const { data } = response.body;
    expect(response.status).toBe(HttpStatus.OK);
    expect(data).toStrictEqual({
      author: feedList[0].blog.name,
      blogPlatform: 'etc',
      blogImage: feedList[0].blog.blogImage ?? null,
      comments: feedList[0].commentCount,
      createdAt: feedList[0].createdAt.toISOString(),
      id: feedList[0].id,
      likes: feedList[0].likeCount,
      path: feedList[0].path,
      summary: feedList[0].summary,
      tag: feedList[0].tags.map((tag) => tag.name),
      thumbnail: feedList[0].thumbnail,
      title: feedList[0].title,
      viewCount: feedList[0].viewCount,
      isOwner: false,
      blogId: feedList[0].blog.id,
      ownerName: feedList[0].blog.userName,
      isOwnerCertified: false,
      isSubscribed: false,
      isBlocked: false,
    });
  });

  it('[200] 태그가 없는 게시글로 요청할 경우 게시글 상세 조회에 성공한다.', async () => {
    // given
    const feedDetailRequestDto = new ManageFeedRequestDto({
      feedId: feedList[1].id,
    });

    // Http when
    const response = await agent.get(`${URL}/${feedDetailRequestDto.feedId}`);

    // Http then
    const { data } = response.body;
    expect(response.status).toBe(HttpStatus.OK);
    expect(data).toStrictEqual({
      author: feedList[1].blog.name,
      blogPlatform: feedList[1].blog.blogPlatform,
      blogImage: feedList[1].blog.blogImage ?? null,
      comments: feedList[1].commentCount,
      createdAt: feedList[1].createdAt.toISOString(),
      id: feedList[1].id,
      likes: feedList[1].likeCount,
      path: feedList[1].path,
      summary: feedList[1].summary,
      tag: [],
      thumbnail: feedList[1].thumbnail,
      title: feedList[1].title,
      viewCount: feedList[1].viewCount,
      isOwner: false,
      blogId: feedList[1].blog.id,
      ownerName: feedList[1].blog.userName,
      isOwnerCertified: false,
      isSubscribed: false,
      isBlocked: false,
    });
  });

  describe('isOwner 필드', () => {
    let user: User;
    let userRepository: UserRepository;

    beforeAll(() => {
      userRepository = testApp.get(UserRepository);
    });

    beforeEach(async () => {
      user = await userRepository.save(
        await UserFixture.createUserCryptFixture(),
      );
    });

    it('[200] RSS 소유자가 조회할 경우 isOwner=true로 응답한다.', async () => {
      // given
      rssAccept.userId = user.id;
      await rssAcceptRepository.save(rssAccept);
      const accessToken = createAccessToken(user);

      // Http when
      const response = await agent
        .get(`${URL}/${feedList[0].id}`)
        .set('Authorization', `Bearer ${accessToken}`);

      // Http then
      const { data } = response.body as { data: { isOwner: boolean } };
      expect(response.status).toBe(HttpStatus.OK);
      expect(data.isOwner).toBe(true);
    });

    it('[200] RSS 소유자가 아닌 사용자가 조회할 경우 isOwner=false로 응답한다.', async () => {
      // given
      const accessToken = createAccessToken(user);

      // Http when
      const response = await agent
        .get(`${URL}/${feedList[0].id}`)
        .set('Authorization', `Bearer ${accessToken}`);

      // Http then
      const { data } = response.body as { data: { isOwner: boolean } };
      expect(response.status).toBe(HttpStatus.OK);
      expect(data.isOwner).toBe(false);
    });
  });

  describe('isBlocked 필드', () => {
    let user: User;
    let userRepository: UserRepository;
    let rssBlockRepository: RssBlockRepository;

    beforeAll(() => {
      userRepository = testApp.get(UserRepository);
      rssBlockRepository = testApp.get(RssBlockRepository);
    });

    beforeEach(async () => {
      user = await userRepository.save(
        await UserFixture.createUserCryptFixture(),
      );
    });

    it('[200] 차단한 RSS의 게시글을 조회할 경우 isBlocked=true로 응답한다.', async () => {
      // given
      await rssBlockRepository.save({
        blocker: { id: user.id },
        blockedRss: { id: rssAccept.id },
      });
      const accessToken = createAccessToken(user);

      // Http when
      const response = await agent
        .get(`${URL}/${feedList[0].id}`)
        .set('Authorization', `Bearer ${accessToken}`);

      // Http then
      const { data } = response.body as { data: { isBlocked: boolean } };
      expect(response.status).toBe(HttpStatus.OK);
      expect(data.isBlocked).toBe(true);
    });

    it('[200] 차단하지 않은 RSS의 게시글을 조회할 경우 isBlocked=false로 응답한다.', async () => {
      // given
      const accessToken = createAccessToken(user);

      // Http when
      const response = await agent
        .get(`${URL}/${feedList[0].id}`)
        .set('Authorization', `Bearer ${accessToken}`);

      // Http then
      const { data } = response.body as { data: { isBlocked: boolean } };
      expect(response.status).toBe(HttpStatus.OK);
      expect(data.isBlocked).toBe(false);
    });

    it('[200] 비로그인으로 조회할 경우 isBlocked=false로 응답한다.', async () => {
      // given
      await rssBlockRepository.save({
        blocker: { id: user.id },
        blockedRss: { id: rssAccept.id },
      });

      // Http when
      const response = await agent.get(`${URL}/${feedList[0].id}`);

      // Http then
      const { data } = response.body as { data: { isBlocked: boolean } };
      expect(response.status).toBe(HttpStatus.OK);
      expect(data.isBlocked).toBe(false);
    });
  });

  describe('Read Feed Interceptor', () => {
    let user: User;
    let userRepository: UserRepository;
    let redisService: RedisService;
    let activityRepository: ActivityRepository;

    beforeAll(() => {
      userRepository = testApp.get(UserRepository);
      redisService = testApp.get(RedisService);
      activityRepository = testApp.get(ActivityRepository);
    });

    beforeEach(async () => {
      user = await userRepository.save(
        await UserFixture.createUserCryptFixture(),
      );
    });

    it('[200] 유효하지 않은 JWT 토큰으로 요청할 경우 활동 기록 없이 피드 상세 조회에 성공한다.', async () => {
      // given
      const feedDetailRequestDto = new ManageFeedRequestDto({
        feedId: feedList[0].id,
      });

      // Http when
      const response = await agent
        .get(`${URL}/${feedDetailRequestDto.feedId}`)
        .set('Authorization', 'Bearer invalid.jwt.token');

      // Http then
      expect(response.status).toBe(HttpStatus.OK);

      // DB, Redis then
      const hasUserFlag = await redisService.sismember(
        `feed:${feedDetailRequestDto.feedId}:userId`,
        user.id,
      );
      expect(hasUserFlag).toBe(0);
    });

    it('[200] 유효한 JWT 토큰으로 처음 피드를 조회할 경우 사용자 활동이 기록된다.', async () => {
      // given
      const feedDetailRequestDto = new ManageFeedRequestDto({
        feedId: feedList[0].id,
      });
      const accessToken = createAccessToken(user);

      // Http when
      const response = await agent
        .get(`${URL}/${feedDetailRequestDto.feedId}`)
        .set('Authorization', `Bearer ${accessToken}`);

      // Http then
      expect(response.status).toBe(HttpStatus.OK);

      const deadline = Date.now() + 2000;
      let updatedUser: User;
      let activities: Activity[];
      do {
        await new Promise<void>((resolve) => setTimeout(resolve, 50));
        [updatedUser, activities] = await Promise.all([
          userRepository.findOneBy({ id: user.id }),
          activityRepository.find({ where: { user: { id: user.id } } }),
        ]);
      } while (
        (updatedUser.totalViews === user.totalViews || activities.length === 0) &&
        Date.now() < deadline
      );

      // DB, Redis then
      const hasUserFlag = await redisService.sismember(
        `feed:${feedDetailRequestDto.feedId}:userId`,
        user.id,
      );
      expect(updatedUser.totalViews).toBe(user.totalViews + 1);
      expect(hasUserFlag).toBe(1);
      expect(activities.length).toBeGreaterThan(0);
    });

    it('[200] 유효한 JWT 토큰으로 이미 조회한 피드를 재조회할 경우 사용자 활동이 중복 기록되지 않는다.', async () => {
      // given
      const feedDetailRequestDto = new ManageFeedRequestDto({
        feedId: feedList[0].id,
      });
      const accessToken = createAccessToken(user);

      await redisService.sadd(
        `feed:${feedDetailRequestDto.feedId}:userId`,
        user.id,
      );
      const initialTotalViews = user.totalViews;

      // Http when
      const response = await agent
        .get(`${URL}/${feedDetailRequestDto.feedId}`)
        .set('Authorization', `Bearer ${accessToken}`);

      // Http then
      expect(response.status).toBe(HttpStatus.OK);

      // DB, Redis then
      const updatedUser = await userRepository.findOneBy({ id: user.id });
      expect(updatedUser.totalViews).toBe(initialTotalViews);
    });
  });
});
