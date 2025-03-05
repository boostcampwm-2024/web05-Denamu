import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { FeedFixture } from '../../fixture/feed.fixture';
import { FeedRepository } from '../../../src/feed/repository/feed.repository';
import { RssAcceptRepository } from '../../../src/rss/repository/rss.repository';
import { RssAcceptFixture } from '../../fixture/rssAccept.fixture';
import { FeedDetailRequestDto } from '../../../src/feed/dto/request/feed-detail.dto';
import { TagMapFixture } from '../../fixture/tag-map.fixture';
import { TagMapRepository } from '../../../src/feed/repository/tag-map.repository';

describe('GET api/feed/detail E2E Test', () => {
  let app: INestApplication;
  const latestId = 20;

  beforeAll(async () => {
    app = global.testApp;
    const feedRepository = app.get(FeedRepository);
    const rssAcceptRepository = app.get(RssAcceptRepository);
    const tagMapRepository = app.get(TagMapRepository);

    const blog = await rssAcceptRepository.save(
      RssAcceptFixture.createRssAcceptFixture(),
    );

    const feeds = Array.from({ length: latestId }).map((_, i) => {
      return FeedFixture.createFeedFixture(blog, _, i + 1);
    });

    const tagMap = feeds.flatMap((feed, i) => {
      if (i < 10) {
        return TagMapFixture.createTagMapFixture(['Frontend', 'React'], feed);
      } else {
        return TagMapFixture.createTagMapFixture([], feed);
      }
    });

    await feedRepository.insert(feeds);
    await tagMapRepository.insert(tagMap);
  });

  it('feedId를 요청 받으면 해당 Feed의 정보로 응답한다.', async () => {
    //given
    const feedDetailRequestDto = new FeedDetailRequestDto({
      feedId: 1,
    });

    //when
    const response = await request(app.getHttpServer()).get(
      `/api/feed/detail/${feedDetailRequestDto.feedId}`,
    );

    //then
    expect(response.status).toBe(200);
    expect(response.body.data.id).toBe(1);
    expect(response.body.data.tag).toStrictEqual(['Frontend', 'React']);
  });

  it('태그가 없다면 빈 배열로 응답한다.', async () => {
    //given
    const feedDetailRequestDto = new FeedDetailRequestDto({
      feedId: 11,
    });

    //when
    const response = await request(app.getHttpServer()).get(
      `/api/feed/detail/${feedDetailRequestDto.feedId}`,
    );

    //then
    expect(response.status).toBe(200);
    expect(response.body.data.id).toBe(11);
    expect(response.body.data.tag).toStrictEqual([]);
  });

  it('없는 피드를 조회한다면 400번 에러를 반환한다.', async () => {
    //given
    const feedDetailRequestDto = new FeedDetailRequestDto({
      feedId: 100,
    });

    //when
    const response = await request(app.getHttpServer()).get(
      `/api/feed/detail/${feedDetailRequestDto.feedId}`,
    );

    //then
    expect(response.status).toBe(400);
  });
});
