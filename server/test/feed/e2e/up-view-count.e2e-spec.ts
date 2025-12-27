import { REDIS_KEYS } from '../../../src/common/redis/redis.constant';
import { HttpStatus } from '@nestjs/common';
import { FeedFixture } from '../../config/common/fixture/feed.fixture';
import { RssAcceptFixture } from '../../config/common/fixture/rss-accept.fixture';
import { Feed } from '../../../src/feed/entity/feed.entity';
import { RssAccept } from '../../../src/rss/entity/rss.entity';
import { FeedE2EHelper } from '../../config/common/helper/feed/feed-helper';

const URL = '/api/feed';

describe(`POST ${URL}/{feedId} E2E Test`, () => {
  const {
    agent,
    redisService,
    feedRepository,
    rssAcceptRepository,
    getReadRedisKey,
  } = new FeedE2EHelper();
  let feed: Feed;
  let rssAccept: RssAccept;
  const testIp = '1.1.1.1';

  beforeEach(async () => {
    rssAccept = await rssAcceptRepository.save(
      RssAcceptFixture.createRssAcceptFixture(),
    );
    feed = await feedRepository.save(FeedFixture.createFeedFixture(rssAccept));
    await redisService.sadd(getReadRedisKey(feed.id.toString()), testIp);
  });

  afterEach(async () => {
    await feedRepository.delete(feed.id);
    await Promise.all([
      rssAcceptRepository.delete(rssAccept.id),
      redisService.del(getReadRedisKey(feed.id.toString())),
    ]);
  });

  it('[404] 피드가 서비스에 존재하지 않을 경우 조회수 상승을 실패한다.', async () => {
    // Http when
    const response = await agent.post(`${URL}/${Number.MAX_SAFE_INTEGER}`);

    // Http then
    const { data } = response.body;
    expect(response.status).toBe(HttpStatus.NOT_FOUND);
    expect(data).toBeUndefined();
  });

  it('[200] 읽은 기록 쿠키가 존재할 경우 조회수 상승을 하지 않는 행위를 성공한다.', async () => {
    // Http when
    const response = await agent
      .post(`${URL}/${feed.id}`)
      .set('Cookie', `View_count_${feed.id}=${feed.id}`)
      .set('X-Forwarded-For', testIp);

    // Http then
    const { data } = response.body;
    expect(response.status).toBe(HttpStatus.OK);
    expect(data).toBeUndefined();

    // DB, Redis when
    const [savedFeed, savedFeedReadRedis] = await Promise.all([
      feedRepository.findOneBy({
        id: feed.id,
      }),
      redisService.sismember(getReadRedisKey(feed.id.toString()), testIp),
    ]);

    // DB, Redis then
    expect(savedFeed.viewCount).toBe(feed.viewCount);
    expect(savedFeedReadRedis).not.toBeNull();
  });

  it('[200] 읽은 기록 쿠키가 없지만 읽은 기록 IP가 있을 경우 조회수 상승을 하지 않는 행위를 성공한다.', async () => {
    // given
    await redisService.sadd(getReadRedisKey(feed.id.toString()), testIp);

    // Http when
    const response = await agent
      .post(`${URL}/${feed.id}`)
      .set('X-Forwarded-For', testIp);

    // Http then
    const { data } = response.body;
    expect(response.status).toBe(HttpStatus.OK);
    expect(response.headers['set-cookie'][0]).toContain(
      `View_count_${feed.id}`,
    );
    expect(data).toBeUndefined();

    // DB, Redis when
    const [savedFeed, savedFeedReadRedis] = await Promise.all([
      feedRepository.findOneBy({
        id: feed.id,
      }),
      redisService.sismember(getReadRedisKey(feed.id.toString()), testIp),
    ]);

    // DB, Redis then
    expect(savedFeed.viewCount).toBe(feed.viewCount);
    expect(savedFeedReadRedis).not.toBeNull();

    // cleanup
    await Promise.all([
      redisService.zrem(REDIS_KEYS.FEED_TREND_KEY, feed.id.toString()),
      redisService.srem(getReadRedisKey(feed.id.toString()), testIp),
    ]);
  });

  it('[200] 피드를 읽은 기록이 없을 경우 조회수 상승을 성공한다.', async () => {
    // given
    const testNewIp = '123.234.123.234';

    // Http when
    const response = await agent
      .post(`${URL}/${feed.id}`)
      .set('X-Forwarded-For', testNewIp);

    // Http then
    const { data } = response.body;
    expect(response.status).toBe(HttpStatus.OK);
    expect(response.headers['set-cookie'][0]).toContain(
      `View_count_${feed.id}`,
    );
    expect(data).toBeUndefined();

    // DB, Redis when
    const [savedFeed, savedFeedReadRedis] = await Promise.all([
      feedRepository.findOneBy({
        id: feed.id,
      }),
      redisService.sismember(getReadRedisKey(feed.id.toString()), testNewIp),
    ]);

    // DB, Redis then
    expect(savedFeed.viewCount).toBe(feed.viewCount + 1);
    expect(savedFeedReadRedis).not.toBeNull();

    // cleanup
    await Promise.all([
      redisService.zrem(REDIS_KEYS.FEED_TREND_KEY, feed.id.toString()),
      redisService.srem(getReadRedisKey(feed.id.toString()), testNewIp),
      feedRepository.update(feed.id, { viewCount: feed.viewCount }),
    ]);
  });
});
