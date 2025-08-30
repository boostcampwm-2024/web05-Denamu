import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { FeedFixture } from '../../fixture/feed.fixture';
import { FeedRepository } from '../../../src/feed/repository/feed.repository';
import { RssAcceptRepository } from '../../../src/rss/repository/rss.repository';
import { RssAcceptFixture } from '../../fixture/rssAccept.fixture';
import { GetFeedDetailRequestDto } from '../../../src/feed/dto/request/getFeedDetail.dto';

describe('GET api/feed/detail E2E Test', () => {
  let app: INestApplication;
  const latestId = 20;

  beforeAll(async () => {
    app = global.testApp;
    const feedRepository = app.get(FeedRepository);
    const rssAcceptRepository = app.get(RssAcceptRepository);

    const blog = await rssAcceptRepository.save(
      RssAcceptFixture.createRssAcceptFixture(),
    );

    const feeds = Array.from({ length: latestId }).map((_, i) => {
      return FeedFixture.createFeedFixture(blog, _, i + 1);
    });

    await feedRepository.insert(feeds);
  });

  it('feedId를 요청 받으면 해당 Feed의 정보로 응답한다.', async () => {
    //given
    const feedDetailRequestDto = new GetFeedDetailRequestDto({
      feedId: 1,
    });

    //when
    const response = await request(app.getHttpServer()).get(
      `/api/feed/detail/${feedDetailRequestDto.feedId}`,
    );

    //then
    expect(response.status).toBe(200);
    expect(response.body.data.id).toBe(1);
  });

  it('태그가 없다면 빈 배열로 응답한다.', async () => {
    //given
    const feedDetailRequestDto = new GetFeedDetailRequestDto({
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

  it('없는 피드를 조회한다면 404번 에러를 반환한다.', async () => {
    //given
    const feedDetailRequestDto = new GetFeedDetailRequestDto({
      feedId: 100,
    });

    //when
    const response = await request(app.getHttpServer()).get(
      `/api/feed/detail/${feedDetailRequestDto.feedId}`,
    );

    //then
    expect(response.status).toBe(404);
  });
});
