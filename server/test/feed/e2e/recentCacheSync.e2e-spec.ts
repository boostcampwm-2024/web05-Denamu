import { HttpStatus } from '@nestjs/common';

import supertest from 'supertest';
import TestAgent from 'supertest/lib/agent';

import { CommentRepository } from '@comment/repository/comment.repository';

import { REDIS_KEYS } from '@common/redis/redis.constant';
import { RedisService } from '@common/redis/redis.service';

import { Feed } from '@feed/entity/feed.entity';
import { FeedRepository } from '@feed/repository/feed.repository';

import { Like } from '@like/entity/like.entity';
import { LikeRepository } from '@like/repository/like.repository';

import { RssAccept } from '@rss/entity/rss.entity';
import { RssAcceptRepository } from '@rss/repository/rss.repository';

import { User } from '@user/entity/user.entity';
import { UserRepository } from '@user/repository/user.repository';

import { CommentFixture } from '@test/config/common/fixture/comment.fixture';
import { FeedFixture } from '@test/config/common/fixture/feed.fixture';
import { RssAcceptFixture } from '@test/config/common/fixture/rss-accept.fixture';
import { UserFixture } from '@test/config/common/fixture/user.fixture';
import { createAccessToken } from '@test/config/e2e/env/jest.setup';
import { testApp } from '@test/config/e2e/env/jest.setup';

describe(`좋아요/댓글 등록·삭제 시 feed:recent 캐시 동기화 E2E Test`, () => {
  let agent: TestAgent;
  let redisService: RedisService;
  let commentRepository: CommentRepository;
  let likeRepository: LikeRepository;
  let userRepository: UserRepository;
  let rssAcceptRepository: RssAcceptRepository;
  let feedRepository: FeedRepository;
  let rssAccept: RssAccept;
  let user: User;
  let feed: Feed;
  let accessToken: string;

  const recentKey = () => REDIS_KEYS.FEED_INFO_ITEM_KEY(feed.id);

  const seedRecentCache = async (likes = 0, comments = 0) => {
    await redisService.executePipeline((pipeline) => {
      pipeline.hset(recentKey(), {
        id: feed.id,
        title: feed.title,
        likes,
        comments,
      });
    });
  };

  beforeAll(() => {
    agent = supertest(testApp.getHttpServer());
    redisService = testApp.get(RedisService);
    commentRepository = testApp.get(CommentRepository);
    likeRepository = testApp.get(LikeRepository);
    userRepository = testApp.get(UserRepository);
    rssAcceptRepository = testApp.get(RssAcceptRepository);
    feedRepository = testApp.get(FeedRepository);
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

  describe('좋아요', () => {
    it('[201] 좋아요 등록 시 캐시가 존재하면 likes 필드가 1 증가한다.', async () => {
      // given
      await seedRecentCache(0, 0);

      // Http when
      const response = await agent
        .post(`/api/feeds/${feed.id}/likes`)
        .set('Authorization', `Bearer ${accessToken}`);

      // Http then
      expect(response.status).toBe(HttpStatus.CREATED);

      // Redis then
      const cache = await redisService.redisClient.hgetall(recentKey());
      expect(cache.likes).toBe('1');
    });

    it('[200] 좋아요 취소 시 캐시가 존재하면 likes 필드가 1 감소한다.', async () => {
      // given
      await seedRecentCache(1, 0);
      await likeRepository.save({ user, feed } as Like);
      await feedRepository.update(feed.id, { likeCount: 1 });

      // Http when
      const response = await agent
        .delete(`/api/feeds/${feed.id}/likes`)
        .set('Authorization', `Bearer ${accessToken}`);

      // Http then
      expect(response.status).toBe(HttpStatus.OK);

      // Redis then
      const cache = await redisService.redisClient.hgetall(recentKey());
      expect(cache.likes).toBe('0');
    });

    it('[201] 최신 피드 캐시에 없는(순위 밀려난) 게시글에 좋아요를 등록해도 phantom 캐시가 생성되지 않는다.', async () => {
      // given - 캐시를 미리 세팅하지 않음

      // Http when
      const response = await agent
        .post(`/api/feeds/${feed.id}/likes`)
        .set('Authorization', `Bearer ${accessToken}`);

      // Http then
      expect(response.status).toBe(HttpStatus.CREATED);

      // Redis then
      const exists = await redisService.redisClient.exists(recentKey());
      expect(exists).toBe(0);
    });
  });

  describe('댓글', () => {
    it('[201] 댓글 등록 시 캐시가 존재하면 comments 필드가 1 증가한다.', async () => {
      // given
      await seedRecentCache(0, 0);

      // Http when
      const response = await agent
        .post(`/api/feeds/${feed.id}/comments`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ comment: '동기화 테스트' });

      // Http then
      expect(response.status).toBe(HttpStatus.CREATED);

      // Redis then
      const cache = await redisService.redisClient.hgetall(recentKey());
      expect(cache.comments).toBe('1');
    });

    it('[200] 답글이 있는 최상위 댓글을 soft delete해도 comments 필드는 변하지 않는다.', async () => {
      // given
      await seedRecentCache(0, 2);
      const root = await commentRepository.save(
        CommentFixture.createCommentFixture(feed, user),
      );
      await commentRepository.save(
        CommentFixture.createCommentFixture(feed, user, {
          parentId: root.id,
        }),
      );

      // Http when
      const response = await agent
        .delete(`/api/feeds/${feed.id}/comments/${root.id}`)
        .set('Authorization', `Bearer ${accessToken}`);

      // Http then
      expect(response.status).toBe(HttpStatus.OK);

      // Redis then
      const cache = await redisService.redisClient.hgetall(recentKey());
      expect(cache.comments).toBe('2');
    });

    it('[200] 답글이 없는 댓글을 삭제하면 comments 필드가 1 감소한다.', async () => {
      // given
      await seedRecentCache(0, 1);
      const comment = await commentRepository.save(
        CommentFixture.createCommentFixture(feed, user),
      );

      // Http when
      const response = await agent
        .delete(`/api/feeds/${feed.id}/comments/${comment.id}`)
        .set('Authorization', `Bearer ${accessToken}`);

      // Http then
      expect(response.status).toBe(HttpStatus.OK);

      // Redis then
      const cache = await redisService.redisClient.hgetall(recentKey());
      expect(cache.comments).toBe('0');
    });

    it('[200] soft delete된 부모의 마지막 답글을 삭제하면 comments 필드가 2 감소한다.', async () => {
      // given
      await seedRecentCache(0, 2);
      const root = await commentRepository.save(
        CommentFixture.createCommentFixture(feed, user),
      );
      const reply = await commentRepository.save(
        CommentFixture.createCommentFixture(feed, user, {
          parentId: root.id,
        }),
      );
      root.isDeleted = true;
      await commentRepository.save(root);

      // Http when
      const response = await agent
        .delete(`/api/feeds/${feed.id}/comments/${reply.id}`)
        .set('Authorization', `Bearer ${accessToken}`);

      // Http then
      expect(response.status).toBe(HttpStatus.OK);

      // Redis then
      const cache = await redisService.redisClient.hgetall(recentKey());
      expect(cache.comments).toBe('0');
    });

    it('[201] 최신 피드 캐시에 없는 게시글에 댓글을 등록해도 phantom 캐시가 생성되지 않는다.', async () => {
      // given - 캐시를 미리 세팅하지 않음

      // Http when
      const response = await agent
        .post(`/api/feeds/${feed.id}/comments`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ comment: 'phantom 방지 테스트' });

      // Http then
      expect(response.status).toBe(HttpStatus.CREATED);

      // Redis then
      const exists = await redisService.redisClient.exists(recentKey());
      expect(exists).toBe(0);
    });
  });
});
