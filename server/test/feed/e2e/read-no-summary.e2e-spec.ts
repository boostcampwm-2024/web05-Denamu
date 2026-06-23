import { HttpStatus } from '@nestjs/common';

import supertest from 'supertest';
import TestAgent from 'supertest/lib/agent';

import { AdminRepository } from '@admin/repository/admin.repository';

import { REDIS_KEYS } from '@common/redis/redis.constant';
import { RedisService } from '@common/redis/redis.service';

import { Feed } from '@feed/entity/feed.entity';
import { FeedRepository } from '@feed/repository/feed.repository';

import { RssAccept } from '@rss/entity/rss.entity';
import { RssAcceptRepository } from '@rss/repository/rss.repository';

import { AdminFixture } from '@test/config/common/fixture/admin.fixture';
import { FeedFixture } from '@test/config/common/fixture/feed.fixture';
import { RssAcceptFixture } from '@test/config/common/fixture/rss-accept.fixture';
import { testApp } from '@test/config/e2e/env/jest.setup';

const URL = '/api/feeds/no-summary';
const AI_SUMMARY_IN_PROGRESS_MESSAGE = '아직 AI가 요약을 진행중인 게시글 이에요! 💭';

describe(`GET ${URL} E2E Test`, () => {
  let agent: TestAgent;
  let redisService: RedisService;
  let feedRepository: FeedRepository;
  let rssAcceptRepository: RssAcceptRepository;
  let adminRepository: AdminRepository;
  let rssAccept: RssAccept;

  const sessionKey = 'no-summary-session-key';
  const adminSessionKey = (sid: string) =>
    `${REDIS_KEYS.ADMIN_AUTH_KEY}:${sid}`;
  const withCookie = () => `sessionId=${sessionKey}`;

  beforeAll(() => {
    agent = supertest(testApp.getHttpServer());
    redisService = testApp.get(RedisService);
    feedRepository = testApp.get(FeedRepository);
    rssAcceptRepository = testApp.get(RssAcceptRepository);
    adminRepository = testApp.get(AdminRepository);
  });

  beforeEach(async () => {
    rssAccept = await rssAcceptRepository.save(
      RssAcceptFixture.createRssAcceptFixture(),
    );
    const admin = await adminRepository.save(
      await AdminFixture.createAdminCryptFixture(),
    );
    await redisService.set(adminSessionKey(sessionKey), admin.email);
  });

  const createFeed = (summary: string | null) =>
    feedRepository.save(FeedFixture.createFeedFixture(rssAccept, { summary }));

  it('[401] 관리자 인증 쿠키가 없으면 실패한다.', async () => {
    // Http when
    const response = await agent.get(URL);

    // Http then
    expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
  });

  it('[200] summary가 NULL/빈문자열(영구 실패)인 게시글만 최신순으로 반환한다.', async () => {
    // given
    const withReal: Feed = await createFeed('실제 요약 내용');
    const withInProgress: Feed = await createFeed(
      AI_SUMMARY_IN_PROGRESS_MESSAGE,
    );
    const withNull: Feed = await createFeed(null);
    const withEmpty: Feed = await createFeed('');

    // Http when
    const response = await agent.get(URL).set('Cookie', withCookie());

    // Http then
    expect(response.status).toBe(HttpStatus.OK);
    const { data } = response.body;
    const result = data as Array<{
      id: number;
      title: string;
      likes: number;
      comments: number;
    }>;

    const ids = result.map((feed) => feed.id);
    // 영구 실패(NULL/빈문자열)만 포함, 최신순(id DESC)
    expect(ids).toEqual([withEmpty.id, withNull.id]);
    // 실제 요약, AI 대기중(placeholder)은 제외
    expect(ids).not.toContain(withReal.id);
    expect(ids).not.toContain(withInProgress.id);

    expect(result[0]).toStrictEqual({
      id: withEmpty.id,
      title: withEmpty.title,
      likes: withEmpty.likeCount,
      comments: withEmpty.commentCount,
    });
  });
});
