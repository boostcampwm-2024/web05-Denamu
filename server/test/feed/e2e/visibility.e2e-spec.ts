import { HttpStatus } from '@nestjs/common';

import supertest from 'supertest';
import TestAgent from 'supertest/lib/agent';

import { GetFeedDetailResponseDto } from '@feed/dto/response/getFeedDetail';
import { ReadFeedPaginationResponseDto } from '@feed/dto/response/readFeedPagination.dto';
import { Feed } from '@feed/entity/feed.entity';
import { FeedRepository } from '@feed/repository/feed.repository';

import { RssAccept } from '@rss/entity/rss.entity';
import { RssAcceptRepository } from '@rss/repository/rss.repository';

import { FeedFixture } from '@test/config/common/fixture/feed.fixture';
import { RssAcceptFixture } from '@test/config/common/fixture/rss-accept.fixture';
import { testApp } from '@test/config/e2e/env/jest.setup';

const URL = '/api/feeds';

describe(`비공개 게시글 공개 노출 제외 E2E Test (feed_view 필터)`, () => {
  let agent: TestAgent;
  let feedRepository: FeedRepository;
  let rssAcceptRepository: RssAcceptRepository;
  let rssAccept: RssAccept;
  let publicFeed: Feed;
  let privateFeed: Feed;

  beforeAll(() => {
    agent = supertest(testApp.getHttpServer());
    feedRepository = testApp.get(FeedRepository);
    rssAcceptRepository = testApp.get(RssAcceptRepository);
  });

  beforeEach(async () => {
    rssAccept = await rssAcceptRepository.save(
      RssAcceptFixture.createRssAcceptFixture(),
    );
    publicFeed = await feedRepository.save(
      FeedFixture.createFeedFixture(rssAccept, { title: '공개글', isPublic: true }),
    );
    privateFeed = await feedRepository.save(
      FeedFixture.createFeedFixture(rssAccept, { title: '비공개글', isPublic: false }),
    );
  });

  it('[200] 페이지네이션에서 비공개 게시글은 제외되고 공개 게시글만 제공된다.', async () => {
    const response = await agent.get(URL).query({ limit: 10 });

    expect(response.status).toBe(HttpStatus.OK);
    const { data }: { data: ReadFeedPaginationResponseDto } = response.body;
    const ids = data.result.map((f) => f.id);
    expect(ids).toContain(publicFeed.id);
    expect(ids).not.toContain(privateFeed.id);
  });

  it('[404] 비공개 게시글 상세 조회는 존재하지 않는 것으로 처리된다.', async () => {
    const response = await agent.get(`${URL}/${privateFeed.id}`);
    expect(response.status).toBe(HttpStatus.NOT_FOUND);
  });

  it('[200] 공개 게시글 상세 조회는 정상 제공된다.', async () => {
    const response = await agent.get(`${URL}/${publicFeed.id}`);
    expect(response.status).toBe(HttpStatus.OK);
    const { data }: { data: GetFeedDetailResponseDto } = response.body;
    expect(data.id).toBe(publicFeed.id);
  });
});
