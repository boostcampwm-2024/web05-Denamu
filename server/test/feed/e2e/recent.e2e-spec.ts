import { HttpStatus } from '@nestjs/common';
import { RssAcceptFixture } from '../../config/common/fixture/rss-accept.fixture';
import { FeedFixture } from '../../config/common/fixture/feed.fixture';
import { Feed } from '../../../src/feed/entity/feed.entity';
import { RssAccept } from '../../../src/rss/entity/rss.entity';
import { FeedE2EHelper } from '../../config/common/helper/feed/feed-helper';

const URL = '/api/feed/recent';

describe(`GET ${URL} E2E Test`, () => {
  const {
    agent,
    feedRepository,
    rssAcceptRepository,
    redisService,
    getRecentRedisKey,
  } = new FeedE2EHelper();
  let feedList: Feed[];
  let rssAccept: RssAccept;

  beforeEach(async () => {
    rssAccept = await rssAcceptRepository.save(
      RssAcceptFixture.createRssAcceptFixture(),
    );
    const feeds = FeedFixture.createFeedsFixture(rssAccept, 2);

    // 최신 피드가 앞쪽에 오도록 생성
    feedList = (await feedRepository.save(feeds)).reverse();
  });

  afterEach(async () => {
    await feedRepository.delete(feedList.map((feed) => feed.id));
    await rssAcceptRepository.delete(rssAccept.id);
  });

  it('[200] 최신 피드 업데이트 요청이 들어올 경우 최신 피드 제공을 성공한다.', async () => {
    // given
    await redisService.executePipeline((pipeline) => {
      feedList.forEach((feed) => {
        pipeline.hset(getRecentRedisKey(feed.id.toString()), {
          id: feed.id,
          blogPlatform: feed.blog.blogPlatform,
          createdAt: feed.createdAt.toISOString(),
          viewCount: feed.viewCount,
          blogName: feed.blog.name,
          thumbnail: feed.thumbnail,
          path: feed.path,
          title: feed.title,
          tag: [],
          likes: feed.likeCount,
          comments: feed.commentCount,
        });
      });
    });

    // Http when
    const response = await agent.get(URL);

    // Http then
    const { data } = response.body;
    expect(response.status).toBe(HttpStatus.OK);
    expect(data).toStrictEqual(
      feedList.map((_, i) => {
        const feed = feedList[i];
        return {
          id: feed.id,
          author: feed.blog.name,
          blogPlatform: feed.blog.blogPlatform,
          title: feed.title,
          path: feed.path,
          tag: [],
          createdAt: feed.createdAt.toISOString(),
          thumbnail: feed.thumbnail,
          viewCount: feed.viewCount,
          likes: feed.likeCount,
          isNew: true,
          comments: feed.commentCount,
        };
      }),
    );

    // cleanup
    await redisService.executePipeline((pipeline) => {
      feedList.forEach((feed) => {
        pipeline.del(getRecentRedisKey(feed.id.toString()));
      });
    });
  });

  it('[200] 최신 피드가 없을 경우 빈 배열 제공을 성공한다.', async () => {
    // Http when
    const response = await agent.get(URL);

    // Http then
    const { data } = response.body;
    expect(response.status).toBe(HttpStatus.OK);
    expect(data).toStrictEqual([]);
  });
});
