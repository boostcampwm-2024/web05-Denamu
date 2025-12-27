import { HttpStatus } from '@nestjs/common';
import { UserFixture } from '../../config/common/fixture/user.fixture';
import { RssAcceptFixture } from '../../config/common/fixture/rss-accept.fixture';
import { FeedFixture } from '../../config/common/fixture/feed.fixture';
import { RssAccept } from '../../../src/rss/entity/rss.entity';
import { User } from '../../../src/user/entity/user.entity';
import { Feed } from '../../../src/feed/entity/feed.entity';
import { ManageLikeRequestDto } from '../../../src/like/dto/request/manageLike.dto';
import { createAccessToken } from '../../config/e2e/env/jest.setup';
import { LikeE2EHelper } from '../../config/common/helper/like/like-helper';

const URL = '/api/like';

describe(`DELETE ${URL}/{feedId} E2E Test`, () => {
  const {
    agent,
    likeRepository,
    userRepository,
    rssAcceptRepository,
    feedRepository,
  } = new LikeE2EHelper();
  let rssAccept: RssAccept;
  let user: User;
  let feed: Feed;
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

  it('[401] 로그인이 되어 있지 않을 경우 좋아요 삭제를 실패한다.', async () => {
    // given
    const requestDto = new ManageLikeRequestDto({
      feedId: feed.id,
    });

    // Http when
    const response = await agent.delete(`${URL}/${requestDto.feedId}`);

    // Http then
    const { data } = response.body;
    expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
    expect(data).toBeUndefined();
  });

  it('[404] 피드가 존재하지 않을 경우 좋아요 삭제를 실패한다.', async () => {
    // given
    const requestDto = new ManageLikeRequestDto({
      feedId: Number.MAX_SAFE_INTEGER,
    });

    // Http when
    const response = await agent
      .delete(`${URL}/${requestDto.feedId}`)
      .set('Authorization', `Bearer ${accessToken}`);

    // Http then
    const { data } = response.body;
    expect(response.status).toBe(HttpStatus.NOT_FOUND);
    expect(data).toBeUndefined();
  });

  it('[404] 좋아요를 안 했을 경우 좋아요 삭제를 실패한다.', async () => {
    // given
    const requestDto = new ManageLikeRequestDto({
      feedId: feed.id,
    });

    // Http when
    const response = await agent
      .delete(`${URL}/${requestDto.feedId}`)
      .set('Authorization', `Bearer ${accessToken}`);

    // Http then
    const { data } = response.body;
    expect(response.status).toBe(HttpStatus.NOT_FOUND);
    expect(data).toBeUndefined();
  });

  it('[200] 로그인이 되어 있고 좋아요를 한 경우 좋아요 삭제를 성공한다.', async () => {
    // given
    await likeRepository.save({
      feed,
      user,
      likeDate: new Date(),
    });
    const requestDto = new ManageLikeRequestDto({
      feedId: feed.id,
    });

    // Http when
    const response = await agent
      .delete(`${URL}/${requestDto.feedId}`)
      .set('Authorization', `Bearer ${accessToken}`);

    // Http then
    const { data } = response.body;
    expect(response.status).toBe(HttpStatus.OK);
    expect(data).toBeUndefined();

    // DB, Redis when
    const savedLike = await likeRepository.findOneBy({
      feed: { id: requestDto.feedId },
      user: { id: user.id },
    });

    // DB, Redis then
    expect(savedLike).toBeNull();
  });
});
