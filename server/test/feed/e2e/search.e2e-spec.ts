import { HttpStatus } from '@nestjs/common';

import supertest from 'supertest';
import TestAgent from 'supertest/lib/agent';

import {
  SearchFeedRequestDto,
  SearchType,
} from '@feed/dto/request/searchFeed.dto';
import { Feed } from '@feed/entity/feed.entity';
import { FeedRepository } from '@feed/repository/feed.repository';

import { RssAccept } from '@rss/entity/rss.entity';
import { RssAcceptRepository } from '@rss/repository/rss.repository';

import { RssBlockRepository } from '@block/repository/rssBlock.repository';

import { UserRepository } from '@user/repository/user.repository';

import { FeedFixture } from '@test/config/common/fixture/feed.fixture';
import { RssAcceptFixture } from '@test/config/common/fixture/rss-accept.fixture';
import { UserFixture } from '@test/config/common/fixture/user.fixture';
import { createAccessToken, testApp } from '@test/config/e2e/env/jest.setup';

const URL = '/api/feeds/search';

describe(`GET ${URL}?type={}&find={} E2E Test`, () => {
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
    const feeds = Array.from({ length: 5 }).map((_, i) =>
      FeedFixture.createFeedFixture(rssAccept, { title: `search-data${i}` }),
    );

    feedList = await feedRepository.save(feeds);
  });

  it('[200] 검색 결과에 적합한 게시글이 존재할 경우 검색 결과 제공을 성공한다.', async () => {
    // given
    const requestDto = new SearchFeedRequestDto({
      type: SearchType.TITLE,
      find: 'search-data',
    });

    // Http when
    const response = await agent.get(URL).query(requestDto);

    // Http then
    const { data } = response.body;
    expect(response.status).toBe(HttpStatus.OK);
    expect(data).toStrictEqual({
      totalCount: 5,
      result: Array.from({ length: 4 }).map((_, i) => {
        const feed = feedList[i];
        return {
          id: feed.id,
          blog: {
            name: feed.blog.name,
            platform: feed.blog.blogPlatform,
            image: feed.blog.blogImage ?? null,
          },
          title: feed.title,
          likes: feed.likeCount,
          comments: feed.commentCount,
          path: feed.path,
          createdAt: feed.createdAt.toISOString(),
          thumbnail: feed.thumbnail,
          viewCount: feed.viewCount,
          tag: [],
        };
      }),
      totalPages: 2,
      limit: 4,
    });
  });

  it('[200] 검색 결과에 적합한 게시글이 없을 경우 빈 배열 제공을 성공한다.', async () => {
    // given
    const requestDto = new SearchFeedRequestDto({
      type: SearchType.TITLE,
      find: 'null',
    });

    // Http when
    const response = await agent.get(URL).query(requestDto);

    // Http then
    const { data } = response.body;
    expect(response.status).toBe(HttpStatus.OK);
    expect(data).toStrictEqual({
      totalCount: 0,
      result: [],
      totalPages: 0,
      limit: 4,
    });
  });

  describe('차단 RSS 필터', () => {
    let userRepository: UserRepository;
    let rssBlockRepository: RssBlockRepository;

    beforeAll(() => {
      userRepository = testApp.get(UserRepository);
      rssBlockRepository = testApp.get(RssBlockRepository);
    });

    it('[200] 로그인한 사용자가 차단한 RSS의 게시글은 검색 결과에서 제외된다.', async () => {
      // given - 동일 검색어의 차단 RSS 게시글 1개 추가
      const blockedRss = await rssAcceptRepository.save(
        RssAcceptFixture.createRssAcceptFixture(),
      );
      const blockedFeed = await feedRepository.save(
        FeedFixture.createFeedFixture(blockedRss, { title: 'search-data99' }),
      );
      const viewer = await userRepository.save(
        await UserFixture.createUserCryptFixture(),
      );
      await rssBlockRepository.save({
        blocker: { id: viewer.id },
        blockedRss: { id: blockedRss.id },
      });
      const accessToken = createAccessToken(viewer);
      const requestDto = new SearchFeedRequestDto({
        type: SearchType.TITLE,
        find: 'search-data',
      });

      // Http when
      const response = await agent
        .get(URL)
        .query(requestDto)
        .set('Authorization', `Bearer ${accessToken}`);

      // Http then
      const { data } = response.body as {
        data: { totalCount: number; result: { id: number }[] };
      };
      expect(response.status).toBe(HttpStatus.OK);
      expect(data.totalCount).toBe(feedList.length);
      expect(data.result.map((feed) => feed.id)).not.toContain(blockedFeed.id);
    });

    it('[200] 비로그인 사용자에게는 차단 여부와 관계없이 검색 결과가 제공된다.', async () => {
      // given
      const blockedRss = await rssAcceptRepository.save(
        RssAcceptFixture.createRssAcceptFixture(),
      );
      const blockedFeed = await feedRepository.save(
        FeedFixture.createFeedFixture(blockedRss, { title: 'search-data99' }),
      );
      const viewer = await userRepository.save(
        await UserFixture.createUserCryptFixture(),
      );
      await rssBlockRepository.save({
        blocker: { id: viewer.id },
        blockedRss: { id: blockedRss.id },
      });
      const requestDto = new SearchFeedRequestDto({
        type: SearchType.TITLE,
        find: 'search-data99',
      });

      // Http when
      const response = await agent.get(URL).query(requestDto);

      // Http then
      const { data } = response.body as {
        data: { result: { id: number }[] };
      };
      expect(response.status).toBe(HttpStatus.OK);
      expect(data.result.map((feed) => feed.id)).toContain(blockedFeed.id);
    });
  });
});
