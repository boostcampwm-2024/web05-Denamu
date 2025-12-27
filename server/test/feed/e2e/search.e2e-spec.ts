import { HttpStatus } from '@nestjs/common';
import { RssAcceptFixture } from '../../config/common/fixture/rss-accept.fixture';
import { FeedFixture } from '../../config/common/fixture/feed.fixture';
import {
  SearchFeedRequestDto,
  SearchType,
} from '../../../src/feed/dto/request/searchFeed.dto';
import { Feed } from '../../../src/feed/entity/feed.entity';
import { RssAccept } from '../../../src/rss/entity/rss.entity';
import { FeedE2EHelper } from '../../config/common/helper/feed/feed-helper';

const URL = '/api/feed/search';

describe(`GET ${URL}?type={}&find={} E2E Test`, () => {
  const { agent, feedRepository, rssAcceptRepository } = new FeedE2EHelper();
  let feedList: Feed[];
  let rssAccept: RssAccept;

  beforeEach(async () => {
    rssAccept = await rssAcceptRepository.save(
      RssAcceptFixture.createRssAcceptFixture(),
    );
    const feeds = Array.from({ length: 5 }).map((_, i) =>
      FeedFixture.createFeedFixture(rssAccept, { title: `search-data${i}` }),
    );

    feedList = await feedRepository.save(feeds);
  });

  afterEach(async () => {
    await feedRepository.delete(feedList.map((feed) => feed.id));
    await rssAcceptRepository.delete(rssAccept.id);
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
          blogName: feed.blog.name,
          title: feed.title,
          likes: feed.likeCount,
          comments: feed.commentCount,
          path: feed.path,
          createdAt: feed.createdAt.toISOString(),
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
});
