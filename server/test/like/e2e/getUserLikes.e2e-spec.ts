import { HttpStatus } from '@nestjs/common';

import supertest from 'supertest';
import TestAgent from 'supertest/lib/agent';

import { Feed } from '@feed/entity/feed.entity';
import { FeedRepository } from '@feed/repository/feed.repository';

import { GetUserLikesResponseDto } from '@like/dto/response/getUserLikes.dto';
import { Like } from '@like/entity/like.entity';
import { LikeRepository } from '@like/repository/like.repository';

import { RssAccept } from '@rss/entity/rss.entity';
import { RssAcceptRepository } from '@rss/repository/rss.repository';

import { User } from '@user/entity/user.entity';
import { UserRepository } from '@user/repository/user.repository';

import { FeedFixture } from '@test/config/common/fixture/feed.fixture';
import { RssAcceptFixture } from '@test/config/common/fixture/rss-accept.fixture';
import { UserFixture } from '@test/config/common/fixture/user.fixture';
import { testApp } from '@test/config/e2e/env/jest.setup';

const BASE_URL = '/api/users';

describe(`GET ${BASE_URL}/:userId/likes E2E Test`, () => {
  let agent: TestAgent;
  let likeRepository: LikeRepository;
  let userRepository: UserRepository;
  let rssAcceptRepository: RssAcceptRepository;
  let feedRepository: FeedRepository;
  let rssAccept: RssAccept;
  let feeds: Feed[];
  let user: User;
  let likes: Like[];

  beforeAll(() => {
    agent = supertest(testApp.getHttpServer());
    likeRepository = testApp.get(LikeRepository);
    userRepository = testApp.get(UserRepository);
    rssAcceptRepository = testApp.get(RssAcceptRepository);
    feedRepository = testApp.get(FeedRepository);
  });

  beforeEach(async () => {
    rssAccept = await rssAcceptRepository.save(
      RssAcceptFixture.createRssAcceptFixture(),
    );
    user = await userRepository.save(await UserFixture.createUserCryptFixture());

    // 동일 유저가 서로 다른 게시글 3개에 좋아요를 id 오름차순으로 저장
    // (likes 테이블은 (user, feed) Unique 제약이 있으므로 게시글을 분리)
    feeds = [];
    likes = [];
    for (let i = 0; i < 3; i++) {
      const feed = await feedRepository.save(
        FeedFixture.createFeedFixture(rssAccept, { title: `title ${i + 1}` }),
      );
      feeds.push(feed);
      likes.push(await likeRepository.save({ user, feed }));
    }
  });

  it('[404] 존재하지 않는 유저일 경우 좋아요 조회를 실패한다.', async () => {
    // Http when
    const response = await agent.get(
      `${BASE_URL}/${Number.MAX_SAFE_INTEGER}/likes`,
    );

    // Http then
    const { data } = response.body;
    expect(response.status).toBe(HttpStatus.NOT_FOUND);
    expect(data).toBeUndefined();
  });

  it('[200] 유저가 좋아요한 게시글 정보(path 포함)를 최신순으로 조회한다.', async () => {
    // Http when
    const response = await agent.get(`${BASE_URL}/${user.id}/likes`);

    // Http then
    const { data }: { data: GetUserLikesResponseDto } = response.body;
    expect(response.status).toBe(HttpStatus.OK);
    expect(data.hasMore).toBe(false);
    expect(data.lastId).toBe(likes[0].id);

    const reversed = [...likes].reverse();
    expect(data.result).toHaveLength(3);
    data.result.forEach((item, idx) => {
      const like = reversed[idx];
      const feed = feeds[likes.indexOf(like)];
      expect(item.id).toBe(like.id);
      expect(item.feed).toStrictEqual({
        id: feed.id,
        title: feed.title,
        path: feed.path,
      });
      expect(item.likeDate).toBeDefined();
    });
  });

  it('[200] limit으로 페이지 크기를 제한하고 hasMore와 커서(lastId)를 반환한다.', async () => {
    // Http when
    const response = await agent.get(`${BASE_URL}/${user.id}/likes?limit=2`);

    // Http then
    const { data }: { data: GetUserLikesResponseDto } = response.body;
    expect(response.status).toBe(HttpStatus.OK);
    expect(data.result).toHaveLength(2);
    expect(data.hasMore).toBe(true);
    // 최신순 → likes[2], likes[1]
    expect(data.result[0].id).toBe(likes[2].id);
    expect(data.lastId).toBe(likes[1].id);
  });

  it('[200] lastId 커서 이후의 좋아요만 조회한다.', async () => {
    // Http when
    const response = await agent.get(
      `${BASE_URL}/${user.id}/likes?lastId=${likes[1].id}`,
    );

    // Http then
    const { data }: { data: GetUserLikesResponseDto } = response.body;
    expect(response.status).toBe(HttpStatus.OK);
    expect(data.result).toHaveLength(1);
    expect(data.result[0].id).toBe(likes[0].id);
    expect(data.hasMore).toBe(false);
  });

  it('[200] 좋아요가 없는 유저는 빈 목록과 lastId=0을 반환한다.', async () => {
    // Http given
    const otherUser = await userRepository.save(
      await UserFixture.createUserCryptFixture(),
    );

    // Http when
    const response = await agent.get(`${BASE_URL}/${otherUser.id}/likes`);

    // Http then
    const { data }: { data: GetUserLikesResponseDto } = response.body;
    expect(response.status).toBe(HttpStatus.OK);
    expect(data.result).toStrictEqual([]);
    expect(data.lastId).toBe(0);
    expect(data.hasMore).toBe(false);
  });
});
