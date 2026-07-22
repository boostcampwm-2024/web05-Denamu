import { HttpStatus } from '@nestjs/common';

import supertest from 'supertest';
import TestAgent from 'supertest/lib/agent';

import { ReadActivityResponseDto } from '@activity/dto/response/readActivity.dto';

import { FeedRepository } from '@feed/repository/feed.repository';

import { RssAccept } from '@rss/entity/rss.entity';
import { RssAcceptRepository } from '@rss/repository/rss.repository';

import { FeedFixture } from '@test/config/common/fixture/feed.fixture';
import { RssAcceptFixture } from '@test/config/common/fixture/rss-accept.fixture';
import { testApp } from '@test/config/e2e/env/jest.setup';

describe(`RSS 발행 활동(잔디) E2E Test`, () => {
  let agent: TestAgent;
  let rssAcceptRepository: RssAcceptRepository;
  let feedRepository: FeedRepository;
  let rssAccept: RssAccept;

  const at = (iso: string) => new Date(`${iso}T12:00:00`);

  beforeAll(() => {
    agent = supertest(testApp.getHttpServer());
    rssAcceptRepository = testApp.get(RssAcceptRepository);
    feedRepository = testApp.get(FeedRepository);
  });

  beforeEach(async () => {
    rssAccept = await rssAcceptRepository.save(
      RssAcceptFixture.createRssAcceptFixture(),
    );

    // 2025-01-05 공개 2건, 2025-03-01 공개 1건, 2025-05-01 비공개 1건, 2024-06-01 공개 1건
    await feedRepository.save(
      FeedFixture.createFeedFixture(rssAccept, {
        createdAt: at('2025-01-05'),
        isPublic: true,
      }),
    );
    await feedRepository.save(
      FeedFixture.createFeedFixture(rssAccept, {
        createdAt: at('2025-01-05'),
        isPublic: true,
      }),
    );
    await feedRepository.save(
      FeedFixture.createFeedFixture(rssAccept, {
        createdAt: at('2025-03-01'),
        isPublic: true,
      }),
    );
    await feedRepository.save(
      FeedFixture.createFeedFixture(rssAccept, {
        createdAt: at('2025-05-01'),
        isPublic: false,
      }),
    );
    await feedRepository.save(
      FeedFixture.createFeedFixture(rssAccept, {
        createdAt: at('2024-06-01'),
        isPublic: true,
      }),
    );
  });

  describe('GET /api/rss/:rssId/activities', () => {
    it('[404] 존재하지 않는 RSS는 조회할 수 없다.', async () => {
      const response = await agent.get(`/api/rss/999999/activities?year=2025`);
      expect(response.status).toBe(HttpStatus.NOT_FOUND);
    });

    it('[200] 해당 연도의 공개 게시글을 일별 발행 건수로 집계한다(비공개/타연도 제외).', async () => {
      const response = await agent.get(
        `/api/rss/${rssAccept.id}/activities?year=2025`,
      );

      expect(response.status).toBe(HttpStatus.OK);
      const { data }: { data: ReadActivityResponseDto } = response.body;
      expect(data.dailyActivities).toEqual([
        { date: '2025-01-05', viewCount: 2 },
        { date: '2025-03-01', viewCount: 1 },
      ]);
    });

    it('[400] year 쿼리가 없으면 검증에 실패한다.', async () => {
      const response = await agent.get(`/api/rss/${rssAccept.id}/activities`);
      expect(response.status).toBe(HttpStatus.BAD_REQUEST);
    });
  });

  describe('GET /api/rss/:rssId/activities/years', () => {
    it('[200] 공개 게시글이 발행된 연도를 내림차순으로 반환한다.', async () => {
      const response = await agent.get(
        `/api/rss/${rssAccept.id}/activities/years`,
      );

      expect(response.status).toBe(HttpStatus.OK);
      const { data }: { data: number[] } = response.body;
      expect(data).toEqual([2025, 2024]);
    });

    it('[404] 존재하지 않는 RSS는 조회할 수 없다.', async () => {
      const response = await agent.get(`/api/rss/999999/activities/years`);
      expect(response.status).toBe(HttpStatus.NOT_FOUND);
    });
  });
});
