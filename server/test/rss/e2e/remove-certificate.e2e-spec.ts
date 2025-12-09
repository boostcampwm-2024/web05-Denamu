import { UserFixture } from '../../fixture/user.fixture';
import { CommentFixture } from '../../fixture/comment.fixture';
import { FeedFixture } from '../../fixture/feed.fixture';
import { REDIS_KEYS } from './../../../src/common/redis/redis.constant';
import { FeedRepository } from '../../../src/feed/repository/feed.repository';
import { HttpStatus, INestApplication } from '@nestjs/common';
import {
  RssAcceptRepository,
  RssRepository,
} from '../../../src/rss/repository/rss.repository';
import { RedisService } from '../../../src/common/redis/redis.service';
import { CommentRepository } from '../../../src/comment/repository/comment.repository';
import { UserRepository } from '../../../src/user/repository/user.repository';
import * as supertest from 'supertest';
import { RssFixture } from '../../fixture/rss.fixture';
import TestAgent from 'supertest/lib/agent';
import { LikeRepository } from '../../../src/like/repository/like.repository';

const URL = '/api/rss/remove';

describe(`DELETE ${URL}/{code} E2E Test`, () => {
  let app: INestApplication;
  let agent: TestAgent;
  let feedRepository: FeedRepository;
  let rssAcceptRepository: RssAcceptRepository;
  let redisService: RedisService;
  let commentRepository: CommentRepository;
  let userRepository: UserRepository;
  let likeRepository: LikeRepository;
  let rssRepository: RssRepository;

  beforeAll(() => {
    app = global.testApp;
    agent = supertest(app.getHttpServer());
    rssAcceptRepository = app.get(RssAcceptRepository);
    rssRepository = app.get(RssRepository);
    redisService = app.get(RedisService);
    feedRepository = app.get(FeedRepository);
    commentRepository = app.get(CommentRepository);
    userRepository = app.get(UserRepository);
    likeRepository = app.get(LikeRepository);
  });

  it('[404] RSS 삭제 요청이 만료되었거나 없을 경우 RSS 삭제 인증을 실패한다.', async () => {
    // given
    const certificateCode = 'test';
    const redisKey = `${REDIS_KEYS.RSS_REMOVE_KEY}:${certificateCode}`;

    // Http when
    const response = await agent.delete(`${URL}/${certificateCode}`);

    // Http then
    const { data } = response.body;
    expect(response.status).toBe(HttpStatus.NOT_FOUND);
    expect(data).toBeUndefined();

    // DB, Redis when
    const savedRssRemoveURL = await redisService.get(redisKey);

    // DB, Redis then
    expect(savedRssRemoveURL).toBeNull();
  });

  it('[200] 삭제 신청된 RSS가 승인된 RSS에 있을 경우 승인된 RSS와 관련된 모든 데이터들의 삭제를 성공한다.', async () => {
    // given
    const certificateCode = 'test';
    const redisKey = `${REDIS_KEYS.RSS_REMOVE_KEY}:${certificateCode}`;
    const rssAccept = await rssAcceptRepository.save(
      RssFixture.createRssFixture(),
    );
    const feed = await feedRepository.save(
      FeedFixture.createFeedFixture(rssAccept),
    );
    const user = await userRepository.save(
      await UserFixture.createUserCryptFixture(),
    );
    await commentRepository.save(
      CommentFixture.createCommentFixture(feed, user),
    );
    await redisService.set(redisKey, rssAccept.rssUrl);

    // Http when
    const response = await agent.delete(`${URL}/${certificateCode}`);

    // Http then
    const { data } = response.body;
    expect(response.status).toBe(HttpStatus.OK);
    expect(data).toBeUndefined();

    // DB, Redis when
    const savedRssAccept = await rssAcceptRepository.findOneBy({
      rssUrl: rssAccept.rssUrl,
    });
    const savedFeed = await feedRepository.findBy({ blog: rssAccept });
    const savedComment = await commentRepository.findBy({ feed });
    const savedLike = await likeRepository.findBy({ feed });
    const savedRssRemoveURL = await redisService.get(redisKey);

    // DB, Redis then
    expect(savedRssAccept).toBeNull();
    expect(savedFeed.length).toBe(0);
    expect(savedComment.length).toBe(0);
    expect(savedLike.length).toBe(0);
    expect(savedRssRemoveURL).toBeNull();
  });

  it('[200] 삭제 신청된 RSS가 대기중인 RSS에 있을 경우 대기중인 RSS 데이터 삭제를 성공한다.', async () => {
    // given
    const certificateCode = 'test';
    const redisKey = `${REDIS_KEYS.RSS_REMOVE_KEY}:${certificateCode}`;
    const rss = await rssRepository.save(RssFixture.createRssFixture());
    await redisService.set(redisKey, rss.rssUrl);

    // Http when
    const response = await agent.delete(`${URL}/${certificateCode}`);

    // Http then
    const { data } = response.body;
    expect(response.status).toBe(HttpStatus.OK);
    expect(data).toBeUndefined();

    // DB, Redis when
    const savedRss = await rssRepository.findOneBy({
      rssUrl: rss.rssUrl,
    });
    const savedRssRemoveURL = await redisService.get(redisKey);

    // DB, Redis then
    expect(savedRss).toBeNull();
    expect(savedRssRemoveURL).toBeNull();
  });
});
