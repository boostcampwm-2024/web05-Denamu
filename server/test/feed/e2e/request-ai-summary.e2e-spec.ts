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

const URL = (feedId: number | string) =>
  `/api/feeds/${feedId}/ai-summary-requests`;
const IN_PROGRESS = '아직 AI가 요약을 진행중인 게시글 이에요! 💭';

describe(`POST /api/feeds/{feedId}/ai-summary-requests E2E Test`, () => {
  let agent: TestAgent;
  let redisService: RedisService;
  let feedRepository: FeedRepository;
  let rssAcceptRepository: RssAcceptRepository;
  let adminRepository: AdminRepository;
  let rssAccept: RssAccept;

  const sessionKey = 'ai-summary-session-key';
  const adminSessionKey = (sid: string) =>
    `${REDIS_KEYS.ADMIN_AUTH_KEY}:${sid}`;

  const readRetryQueue = () =>
    redisService.lrange(REDIS_KEYS.FEED_AI_RETRY_QUEUE, 0, -1);

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

  it('[401] 관리자 인증 쿠키가 없으면 실패하고 큐에 넣지 않는다.', async () => {
    // given
    const feed: Feed = await createFeed(null);

    // Http when
    const response = await agent.post(URL(feed.id));

    // Http then
    expect(response.status).toBe(HttpStatus.UNAUTHORIZED);

    // Redis then
    expect(await readRetryQueue()).toHaveLength(0);
  });

  it('[404] 존재하지 않는 피드면 실패한다.', async () => {
    // Http when
    const response = await agent
      .post(URL(Number.MAX_SAFE_INTEGER))
      .set('Cookie', `sessionId=${sessionKey}`);

    // Http then
    expect(response.status).toBe(HttpStatus.NOT_FOUND);
    expect(await readRetryQueue()).toHaveLength(0);
  });

  it('[202] 요약이 NULL(영구 실패)인 피드를 deathCount 0으로 재요청 큐에 넣는다.', async () => {
    // given
    const feed: Feed = await createFeed(null);

    // Http when
    const response = await agent
      .post(URL(feed.id))
      .set('Cookie', `sessionId=${sessionKey}`);

    // Http then
    expect(response.status).toBe(HttpStatus.ACCEPTED);

    // Redis then
    const queued = await readRetryQueue();
    expect(queued).toHaveLength(1);
    expect(JSON.parse(queued[0])).toMatchObject({
      feedId: feed.id,
      deathCount: 0,
    });
  });

  it('[202] 요약이 진행중 placeholder(요청 미전송)인 피드를 재요청 큐에 넣는다.', async () => {
    // given
    const feed: Feed = await createFeed(IN_PROGRESS);

    // Http when
    const response = await agent
      .post(URL(feed.id))
      .set('Cookie', `sessionId=${sessionKey}`);

    // Http then
    expect(response.status).toBe(HttpStatus.ACCEPTED);

    // Redis then
    const queued = await readRetryQueue();
    expect(queued).toHaveLength(1);
    expect(JSON.parse(queued[0])).toMatchObject({ feedId: feed.id });
  });
});
