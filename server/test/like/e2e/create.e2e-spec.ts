import { HttpStatus } from '@nestjs/common';
import { UserFixture } from '../../config/common/fixture/user.fixture';
import { RssAcceptFixture } from '../../config/common/fixture/rss-accept.fixture';
import { FeedFixture } from '../../config/common/fixture/feed.fixture';
import { User } from '../../../src/user/entity/user.entity';
import { Feed } from '../../../src/feed/entity/feed.entity';
import { ManageLikeRequestDto } from '../../../src/like/dto/request/manageLike.dto';
import { createAccessToken } from '../../config/e2e/env/jest.setup';
import { RssAccept } from '../../../src/rss/entity/rss.entity';
import { LikeE2EHelper } from '../../config/common/helper/like/like-helper';

const URL = '/api/like';

describe(`POST ${URL} E2E Test`, () => {
  const {
    agent,
    likeRepository,
    userRepository,
    rssAcceptRepository,
    feedRepository,
  } = new LikeE2EHelper();
  let user: User;
  let feed: Feed;
  let rssAccept: RssAccept;
  let accessToken: string;

  beforeEach(async () => {
    rssAccept = await rssAcceptRepository.save(
      RssAcceptFixture.createRssAcceptFixture(),
    );
    [user, feed] = await Promise.all([
      userRepository.save(await UserFixture.createUserCryptFixture()),
      feedRepository.save(FeedFixture.createFeedFixture(rssAccept)),
    ]);
    accessToken = createAccessToken(user);
  });

  afterEach(async () => {
    await Promise.all([
      feedRepository.delete(feed.id),
      userRepository.delete(user.id),
    ]);
    await rssAcceptRepository.delete(rssAccept.id);
  });

  it('[401] 로그인이 되어 있지 않을 경우 좋아요 등록을 실패한다.', async () => {
    // given
    const requestDto = new ManageLikeRequestDto({
      feedId: feed.id,
    });

    // Http when
    const response = await agent.post(URL).send(requestDto);

    // Http then
    const { data } = response.body;
    expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
    expect(data).toBeUndefined();

    // DB, Redis when
    const savedLike = await likeRepository.findOneBy({
      feed: { id: requestDto.feedId },
      user: { id: user.id },
    });

    // DB, Redis then
    expect(savedLike).toBeNull();
  });

  it('[404] 게시글이 서비스에 존재하지 않을 경우 좋아요 등록을 실패한다.', async () => {
    // given
    const requestDto = new ManageLikeRequestDto({
      feedId: Number.MAX_SAFE_INTEGER,
    });

    // Http when
    const response = await agent
      .post(URL)
      .set('Authorization', `Bearer ${accessToken}`)
      .send(requestDto);

    // Http then
    const { data } = response.body;
    expect(response.status).toBe(HttpStatus.NOT_FOUND);
    expect(data).toBeUndefined();

    // DB, Redis when
    const savedLike = await likeRepository.findOneBy({
      feed: { id: requestDto.feedId },
      user: { id: user.id },
    });

    // DB, Redis then
    expect(savedLike).toBeNull();
  });

  it('[409] 이미 좋아요를 한 게시글일 경우 좋아요 등록을 실패한다.', async () => {
    // given
    const like = await likeRepository.save({
      user,
      feed,
    });
    const requestDto = new ManageLikeRequestDto({
      feedId: feed.id,
    });

    // Http when
    const response = await agent
      .post(URL)
      .set('Authorization', `Bearer ${accessToken}`)
      .send(requestDto);

    // Http then
    const { data } = response.body;
    expect(response.status).toBe(HttpStatus.CONFLICT);
    expect(data).toBeUndefined();

    // DB, Redis when
    const savedLike = await likeRepository.findBy({
      feed: { id: requestDto.feedId },
      user: { id: user.id },
    });

    // DB, Redis then
    expect(savedLike.length).toBe(1);

    // cleanup
    await likeRepository.delete(like.id);
  });

  it('[201] 로그인이 되어 있으며 좋아요를 한 적이 없을 경우 좋아요 등록을 성공한다.', async () => {
    // given
    const requestDto = new ManageLikeRequestDto({
      feedId: feed.id,
    });

    // Http when
    const response = await agent
      .post(URL)
      .set('Authorization', `Bearer ${accessToken}`)
      .send(requestDto);

    // Http then
    const { data } = response.body;
    expect(response.status).toBe(HttpStatus.CREATED);
    expect(data).toBeUndefined();

    // DB, Redis when
    const savedLike = await likeRepository.findOneBy({
      feed: { id: requestDto.feedId },
      user: { id: user.id },
    });

    // DB, Redis then
    expect(savedLike).not.toBeNull();

    // cleanup
    await likeRepository.delete(savedLike.id);
  });
});
