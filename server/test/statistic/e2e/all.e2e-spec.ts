import supertest from 'supertest';
import { HttpStatus } from '@nestjs/common';
import { RssAcceptRepository } from '@rss/repository/rss.repository';
import { FeedRepository } from '@feed/repository/feed.repository';
import { RssAcceptFixture } from '@test/config/common/fixture/rss-accept.fixture';
import { FeedFixture } from '@test/config/common/fixture/feed.fixture';
import { Feed } from '@feed/entity/feed.entity';
import TestAgent from 'supertest/lib/agent';
import { ReadStatisticRequestDto } from '@statistic/dto/request/readStatistic.dto';
import { RssAccept } from '@rss/entity/rss.entity';
import { testApp } from '@test/config/e2e/env/jest.setup';

const URL = '/api/statistic/all';

describe(`GET ${URL}?limit={} E2E Test`, () => {
  let agent: TestAgent;
  let feedList: Feed[];
  let rssAcceptRepository: RssAcceptRepository;
  let feedRepository: FeedRepository;
  let rssAccept: RssAccept;

  beforeAll(() => {
    agent = supertest(testApp.getHttpServer());
    rssAcceptRepository = testApp.get(RssAcceptRepository);
    feedRepository = testApp.get(FeedRepository);
  });

  beforeEach(async () => {
    rssAccept = await rssAcceptRepository.save(
      RssAcceptFixture.createRssAcceptFixture(),
    );
    const feeds = Array.from({ length: 2 }).map((_, i) =>
      FeedFixture.createFeedFixture(rssAccept, {
        viewCount: (i + 1) * 5,
      }),
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
      feedList.map((feed) => ({
        id: feed.id,
        title: feed.title,
        viewCount: feed.viewCount,
      })),
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
