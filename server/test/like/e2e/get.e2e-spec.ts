import { HttpStatus } from '@nestjs/common';
import { UserFixture } from '../../config/common/fixture/user.fixture';
import { RssAcceptFixture } from '../../config/common/fixture/rss-accept.fixture';
import { FeedFixture } from '../../config/common/fixture/feed.fixture';
import { Feed } from '../../../src/feed/entity/feed.entity';
import { createAccessToken } from '../../config/e2e/env/jest.setup';
import { User } from '../../../src/user/entity/user.entity';
import { RssAccept } from '../../../src/rss/entity/rss.entity';
import { Like } from '../../../src/like/entity/like.entity';
import { LikeE2EHelper } from '../../config/common/helper/like/like-helper';

const URL = '/api/like';

describe(`GET ${URL}/{feedId} E2E Test`, () => {
  const {
    agent,
    likeRepository,
    userRepository,
    feedRepository,
    rssAcceptRepository,
  } = new LikeE2EHelper();
  let feed: Feed;
  let user: User;
  let rssAccept: RssAccept;
  let like: Like;

  beforeEach(async () => {
    rssAccept = await rssAcceptRepository.save(
      RssAcceptFixture.createRssAcceptFixture(),
    );
    [user, feed] = await Promise.all([
      userRepository.save(await UserFixture.createUserCryptFixture()),
      feedRepository.save(FeedFixture.createFeedFixture(rssAccept)),
    ]);
    like = await likeRepository.save({ user, feed });
  });

  afterEach(async () => {
    await likeRepository.delete(like.id);
    await Promise.all([
      feedRepository.delete(feed.id),
      userRepository.delete(user.id),
    ]);
    await rssAcceptRepository.delete(rssAccept.id);
  });

  it('[404] 게시글이 존재하지 않을 경우 좋아요 정보 제공을 실패한다.', async () => {
    // Http when
    const response = await agent.get(`${URL}/${Number.MAX_SAFE_INTEGER}`);

    // Http then
    const { data } = response.body;
    expect(response.status).toBe(HttpStatus.NOT_FOUND);
    expect(data).toBeUndefined();
  });

  it('[200] 로그인하지 않은 상황에서 게시글에 대한 좋아요 조회 요청을 받을 경우 좋아요 정보 제공을 성공한다.', async () => {
    // Http when
    const response = await agent.get(`${URL}/${feed.id}`);

    // Http then
    const { data } = response.body;
    expect(response.status).toBe(HttpStatus.OK);
    expect(data).toStrictEqual({
      isLike: false,
    });
  });

  it('[200] 로그인한 상황에서 게시글에 대한 좋아요 조회 요청을 받을 경우 좋아요 정보 제공을 성공한다.', async () => {
    // given
    const accessToken = createAccessToken(user);

    // Http when
    const response = await agent
      .get(`${URL}/${feed.id}`)
      .set('Authorization', `Bearer ${accessToken}`);

    // Http then
    const { data } = response.body;
    expect(response.status).toBe(HttpStatus.OK);
    expect(data).toStrictEqual({
      isLike: true,
    });
  });
});
