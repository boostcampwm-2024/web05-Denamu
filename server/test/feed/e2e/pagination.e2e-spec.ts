import { HttpStatus } from '@nestjs/common';

import supertest from 'supertest';
import TestAgent from 'supertest/lib/agent';

import { RssBlockRepository } from '@block/repository/rssBlock.repository';

import { ReadFeedPaginationRequestDto } from '@feed/dto/request/readFeedPagination.dto';
import { Feed } from '@feed/entity/feed.entity';
import { FeedRepository } from '@feed/repository/feed.repository';

import { RssAccept } from '@rss/entity/rss.entity';
import { RssAcceptRepository } from '@rss/repository/rss.repository';

import { UserRepository } from '@user/repository/user.repository';

import { FeedFixture } from '@test/config/common/fixture/feed.fixture';
import { RssAcceptFixture } from '@test/config/common/fixture/rss-accept.fixture';
import { UserFixture } from '@test/config/common/fixture/user.fixture';
import { createAccessToken, testApp } from '@test/config/e2e/env/jest.setup';

const URL = '/api/feeds';

describe(`GET ${URL}?limit={}&lastId={} E2E Test`, () => {
  let agent: TestAgent;
  let feedList: Feed[];
  let rssAccept: RssAccept;
  let feedRepository: FeedRepository;
  let rssAcceptRepository: RssAcceptRepository;

  beforeAll(() => {
    agent = supertest(testApp.getHttpServer());
    feedRepository = testApp.get(FeedRepository);
    rssAcceptRepository = testApp.get(RssAcceptRepository);
  });

  beforeEach(async () => {
    rssAccept = await rssAcceptRepository.save(
      RssAcceptFixture.createRssAcceptFixture(),
    );
    const feeds = Array.from({ length: 10 }).map(() =>
      FeedFixture.createFeedFixture(rssAccept),
    );

    // 최신 게시글부터 제공하기에 테스트 편의성을 위해 최신 게시글을 앞으로
    feedList = (await feedRepository.save(feeds)).reverse();
  });

  it('[200] 마지막 수신 피드 ID가 없을 경우 최신 피드부터 피드 목록 제공을 성공한다.', async () => {
    // given
    const requestDto = new ReadFeedPaginationRequestDto({
      limit: 5,
    });

    // Http when
    const response = await agent.get(URL).query(requestDto);

    // Http then
    const { data } = response.body;
    expect(response.status).toBe(HttpStatus.OK);
    expect(data).toStrictEqual({
      result: Array.from({ length: requestDto.limit }).map((_, i) => {
        const index = 0 + i;
        const feed = feedList[index];

        return {
          id: feed.id,
          blog: {
            name: feed.blog.name,
            platform: feed.blog.blogPlatform,
            image: null,
          },
          title: feed.title,
          path: feed.path,
          createdAt: feed.createdAt.toISOString(),
          thumbnail: feed.thumbnail,
          viewCount: feed.viewCount,
          tag: [],
          likes: feed.likeCount,
          comments: feed.commentCount,
          isNew: false,
        };
      }),
      lastId: feedList[requestDto.limit - 1].id,
      hasMore: true,
    });
  });

  it('[200] 마지막 수신 피드 ID가 있을 경우 마지막 수신 피드 이후의 피드 목록 제공을 성공한다.', async () => {
    // given
    const requestDto = new ReadFeedPaginationRequestDto({
      limit: 3,
      lastId: feedList[3].id,
    });

    // Http when
    const response = await agent.get(URL).query(requestDto);

    // Http then
    const { data } = response.body;
    expect(response.status).toBe(HttpStatus.OK);
    expect(data).toStrictEqual({
      result: Array.from({ length: requestDto.limit }).map((_, i) => {
        const index = 4 + i;
        const feed = feedList[index];

        return {
          id: feed.id,
          blog: {
            name: feed.blog.name,
            platform: feed.blog.blogPlatform,
            image: null,
          },
          title: feed.title,
          path: feed.path,
          createdAt: feed.createdAt.toISOString(),
          thumbnail: feed.thumbnail,
          viewCount: feed.viewCount,
          tag: [],
          likes: feed.likeCount,
          comments: feed.commentCount,
          isNew: false,
        };
      }),
      lastId: feedList[6].id,
      hasMore: true,
    });
  });

  it('[200] 받고자 하는 수신 피드 개수가 남은 피드 개수보다 많을 경우 남은 모든 피드 목록 제공을 성공한다.', async () => {
    // given
    const requestDto = new ReadFeedPaginationRequestDto({
      limit: 10,
      lastId: feedList[5].id,
    });

    // Http when
    const response = await agent.get(URL).query(requestDto);

    // Http then
    const { data } = response.body;
    expect(response.status).toBe(HttpStatus.OK);
    expect(data).toStrictEqual({
      result: Array.from({ length: requestDto.limit })
        .map((_, i) => {
          const index = 6 + i;
          const feed = feedList[index];

          return !feed
            ? null
            : {
                id: feed.id,
                blog: {
                  name: feed.blog.name,
                  platform: feed.blog.blogPlatform,
                  image: null,
                },
                title: feed.title,
                path: feed.path,
                createdAt: feed.createdAt.toISOString(),
                thumbnail: feed.thumbnail,
                viewCount: feed.viewCount,
                tag: [],
                likes: feed.likeCount,
                comments: feed.commentCount,
                isNew: false,
              };
        })
        .filter((value) => value),
      lastId: feedList[feedList.length - 1].id,
      hasMore: false,
    });
  });

  it('[200] 남은 피드 개수가 없을 경우 빈 배열과 마지막 피드 ID를 0으로 제공을 성공한다.', async () => {
    // given
    const requestDto = new ReadFeedPaginationRequestDto({
      limit: 15,
      lastId: feedList[feedList.length - 1].id,
    });

    // Http when
    const response = await agent.get(URL).query(requestDto);

    // Http then
    const { data } = response.body;
    expect(response.status).toBe(HttpStatus.OK);
    expect(data).toStrictEqual({
      result: [],
      lastId: 0,
      hasMore: false,
    });
  });

  describe('차단 RSS 필터', () => {
    let userRepository: UserRepository;
    let rssBlockRepository: RssBlockRepository;

    beforeAll(() => {
      userRepository = testApp.get(UserRepository);
      rssBlockRepository = testApp.get(RssBlockRepository);
    });

    it('[200] 로그인한 사용자가 차단한 RSS의 게시글은 피드 목록에서 제외된다.', async () => {
      // given - 차단된 RSS의 게시글 1개 추가
      const blockedRss = await rssAcceptRepository.save(
        RssAcceptFixture.createRssAcceptFixture(),
      );
      const blockedFeed = await feedRepository.save(
        FeedFixture.createFeedFixture(blockedRss),
      );
      const viewer = await userRepository.save(
        await UserFixture.createUserCryptFixture(),
      );
      await rssBlockRepository.save({
        blocker: { id: viewer.id },
        blockedRss: { id: blockedRss.id },
      });
      const accessToken = createAccessToken(viewer);

      // Http when
      const response = await agent
        .get(URL)
        .query({ limit: 20 })
        .set('Authorization', `Bearer ${accessToken}`);

      // Http then
      const { data } = response.body as {
        data: { result: { id: number }[] };
      };
      expect(response.status).toBe(HttpStatus.OK);
      const ids = data.result.map((feed) => feed.id);
      expect(ids).not.toContain(blockedFeed.id);
      expect(ids).toHaveLength(feedList.length);
    });

    it('[200] 비로그인 사용자에게는 차단 여부와 관계없이 모든 게시글이 제공된다.', async () => {
      // given
      const blockedRss = await rssAcceptRepository.save(
        RssAcceptFixture.createRssAcceptFixture(),
      );
      const blockedFeed = await feedRepository.save(
        FeedFixture.createFeedFixture(blockedRss),
      );
      const viewer = await userRepository.save(
        await UserFixture.createUserCryptFixture(),
      );
      await rssBlockRepository.save({
        blocker: { id: viewer.id },
        blockedRss: { id: blockedRss.id },
      });

      // Http when
      const response = await agent.get(URL).query({ limit: 20 });

      // Http then
      const { data } = response.body as {
        data: { result: { id: number }[] };
      };
      expect(response.status).toBe(HttpStatus.OK);
      expect(data.result.map((feed) => feed.id)).toContain(blockedFeed.id);
    });
  });
});
