import * as supertest from 'supertest';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { RssAcceptRepository } from '../../../src/rss/repository/rss.repository';
import { FeedRepository } from '../../../src/feed/repository/feed.repository';
import { RssAcceptFixture } from '../../config/common/fixture/rss-accept.fixture';
import { FeedFixture } from '../../config/common/fixture/feed.fixture';
import { Feed } from '../../../src/feed/entity/feed.entity';
import TestAgent from 'supertest/lib/agent';
import { ReadStatisticRequestDto } from '../../../src/statistic/dto/request/readStatistic.dto';

const URL = '/api/statistic/all';

describe(`GET ${URL}?limit={} E2E Test`, () => {
  let app: INestApplication;
  let agent: TestAgent;
  let feedList: Feed[];

  beforeAll(async () => {
    app = global.testApp;
    agent = supertest(app.getHttpServer());
    const rssAcceptRepository = app.get(RssAcceptRepository);
    const feedRepository = app.get(FeedRepository);
    const rssAccept = await rssAcceptRepository.save(
      RssAcceptFixture.createRssAcceptFixture(),
    );
    const feeds = Array.from({ length: 2 }).map((_, i) =>
      FeedFixture.createFeedFixture(rssAccept, { viewCount: i }, i + 1),
    );
    feedList = (await feedRepository.save(feeds)).reverse();
  });

  it('[200] 전체 조회수 통계 요청을 받은 경우 전체 조회수 통계 조회를 성공한다.', async () => {
    // Http when
    const response = await agent.get(URL);

    // Http then
    const { data } = response.body;
    expect(response.status).toBe(HttpStatus.OK);
    expect(data).toStrictEqual(
      Array.from({ length: 2 }).map((_, i) => {
        const feed = feedList[i];
        return {
          id: feed.id,
          title: feed.title,
          viewCount: feed.viewCount,
        };
      }),
    );
  });

  it('[200] 전체 조회수 통계에서 개수 제한을 걸 경우 특정 개수만큼의 전체 조회수 통계 조회를 성공한다.', async () => {
    // given
    const limit = 1;
    const requestDto = new ReadStatisticRequestDto({ limit });

    // Http when
    const response = await agent.get(URL).query(requestDto);

    // Http then
    const { data } = response.body;
    expect(response.status).toBe(HttpStatus.OK);
    expect(data).toStrictEqual(
      Array.from({ length: limit }).map((_, i) => {
        const feed = feedList[i];
        return {
          id: feed.id,
          title: feed.title,
          viewCount: feed.viewCount,
        };
      }),
    );
  });
});
