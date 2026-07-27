import { HttpStatus } from '@nestjs/common';

import supertest from 'supertest';
import TestAgent from 'supertest/lib/agent';

import { Feed } from '@feed/entity/feed.entity';
import { FeedRepository } from '@feed/repository/feed.repository';

import { GetNotificationsResponseDto } from '@notification/dto/response/getNotifications.dto';
import { GetUnreadCountResponseDto } from '@notification/dto/response/getUnreadCount.dto';
import { NotificationRepository } from '@notification/repository/notification.repository';

import { RssAccept } from '@rss/entity/rss.entity';
import { RssAcceptRepository } from '@rss/repository/rss.repository';

import { User } from '@user/entity/user.entity';
import { UserRepository } from '@user/repository/user.repository';

import { FeedFixture } from '@test/config/common/fixture/feed.fixture';
import { RssAcceptFixture } from '@test/config/common/fixture/rss-accept.fixture';
import { UserFixture } from '@test/config/common/fixture/user.fixture';
import { createAccessToken, testApp } from '@test/config/e2e/env/jest.setup';

const NOTIFICATION_URL = '/api/notifications';

async function waitFor<T>(
  check: () => Promise<T>,
  isDone: (value: T) => boolean,
  timeoutMs = 3000,
  intervalMs = 50,
): Promise<T> {
  const start = Date.now();
  let last: T;
  do {
    last = await check();
    if (isDone(last)) return last;
    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  } while (Date.now() - start < timeoutMs);
  return last;
}

describe(`${NOTIFICATION_URL} E2E Test`, () => {
  let agent: TestAgent;
  let userRepository: UserRepository;
  let rssAcceptRepository: RssAcceptRepository;
  let feedRepository: FeedRepository;
  let notificationRepository: NotificationRepository;
  let owner: User;
  let liker: User;
  let rssAccept: RssAccept;
  let feed: Feed;
  let ownerToken: string;
  let likerToken: string;

  beforeAll(() => {
    agent = supertest(testApp.getHttpServer());
    userRepository = testApp.get(UserRepository);
    rssAcceptRepository = testApp.get(RssAcceptRepository);
    feedRepository = testApp.get(FeedRepository);
    notificationRepository = testApp.get(NotificationRepository);
  });

  beforeEach(async () => {
    owner = await userRepository.save(await UserFixture.createUserCryptFixture());
    liker = await userRepository.save(await UserFixture.createUserCryptFixture());
    rssAccept = await rssAcceptRepository.save(
      RssAcceptFixture.createRssAcceptFixture({ user: owner }),
    );
    feed = await feedRepository.save(FeedFixture.createFeedFixture(rssAccept));
    ownerToken = createAccessToken({ id: owner.id });
    likerToken = createAccessToken({ id: liker.id });
  });

  const likeFeed = (token: string) =>
    agent.post(`/api/feeds/${feed.id}/likes`).set('Authorization', `Bearer ${token}`);

  const unlikeFeed = (token: string) =>
    agent.delete(`/api/feeds/${feed.id}/likes`).set('Authorization', `Bearer ${token}`);

  const getUnreadCount = async (token: string) => {
    const response = await agent
      .get(`${NOTIFICATION_URL}/unread-count`)
      .set('Authorization', `Bearer ${token}`);
    const { data } = response.body;
    return data as GetUnreadCountResponseDto;
  };

  const getNotifications = async (token: string) => {
    const response = await agent
      .get(NOTIFICATION_URL)
      .set('Authorization', `Bearer ${token}`);
    const { data } = response.body;
    return data as GetNotificationsResponseDto;
  };

  it('[401] 인증되지 않은 요청은 읽지 않은 알림 개수 조회를 실패한다.', async () => {
    // Http when
    const response = await agent.get(`${NOTIFICATION_URL}/unread-count`);

    // Http then
    expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
  });

  it('[200] 본인 게시글에 본인이 좋아요를 누르면(self-like) 알림이 생성되지 않는다.', async () => {
    // Http when
    await likeFeed(ownerToken).expect(HttpStatus.CREATED);

    // then - self-like는 즉시 반영되므로 폴링 없이 바로 확인 가능
    await new Promise((resolve) => setTimeout(resolve, 300));
    const count = await getUnreadCount(ownerToken);
    expect(count.count).toBe(0);
  });

  it('[200] 타인이 좋아요를 누르면 게시글 소유자에게 알림이 생성된다.', async () => {
    // Http when
    await likeFeed(likerToken).expect(HttpStatus.CREATED);

    // then
    const count = await waitFor(
      () => getUnreadCount(ownerToken),
      (result) => result.count > 0,
    );
    expect(count.count).toBe(1);

    const notifications = await getNotifications(ownerToken);
    expect(notifications.result).toHaveLength(1);
    const item = notifications.result[0];
    expect(item.type).toBe('LIKE');
    expect(item.isRead).toBe(false);
    expect(item.feed).toStrictEqual({ id: feed.id, title: feed.title, path: feed.path });
    expect(item.actor.userName).toBe(liker.userName);
    expect(item.otherCount).toBe(0);
  });

  it('[200] 여러 명이 좋아요를 누르면 최신 좋아요 사용자 외 나머지 인원 수가 otherCount로 표시된다.', async () => {
    // given
    const secondLiker = await userRepository.save(await UserFixture.createUserCryptFixture());
    const secondLikerToken = createAccessToken({ id: secondLiker.id });

    // Http when
    await likeFeed(likerToken).expect(HttpStatus.CREATED);
    await waitFor(
      () => getUnreadCount(ownerToken),
      (result) => result.count > 0,
    );
    await likeFeed(secondLikerToken).expect(HttpStatus.CREATED);

    // then
    const notifications = await waitFor(
      () => getNotifications(ownerToken),
      (result) => result.result[0]?.actor.userName === secondLiker.userName,
    );
    const item = notifications.result[0];
    expect(item.actor.userName).toBe(secondLiker.userName);
    expect(item.otherCount).toBe(1);
  });

  it('[200] 좋아요를 누른 사람은 알림을 받지 않는다(수신자는 게시글 소유자).', async () => {
    // Http when
    await likeFeed(likerToken).expect(HttpStatus.CREATED);
    await waitFor(
      () => getUnreadCount(ownerToken),
      (result) => result.count > 0,
    );

    // then
    const likerCount = await getUnreadCount(likerToken);
    expect(likerCount.count).toBe(0);
  });

  it('[200] 알림을 읽음 처리하면 읽지 않은 알림 개수가 감소한다.', async () => {
    // given
    await likeFeed(likerToken).expect(HttpStatus.CREATED);
    await waitFor(
      () => getUnreadCount(ownerToken),
      (result) => result.count > 0,
    );
    const notifications = await getNotifications(ownerToken);
    const notificationId = notifications.result[0].id;

    // Http when
    const response = await agent
      .patch(`${NOTIFICATION_URL}/${notificationId}/read`)
      .set('Authorization', `Bearer ${ownerToken}`);

    // Http then
    expect(response.status).toBe(HttpStatus.OK);
    const count = await getUnreadCount(ownerToken);
    expect(count.count).toBe(0);
  });

  it('[404] 본인 소유가 아닌 알림을 읽음 처리하면 실패한다.', async () => {
    // given
    await likeFeed(likerToken).expect(HttpStatus.CREATED);
    const notifications = await waitFor(
      () => getNotifications(ownerToken),
      (result) => result.result.length > 0,
    );
    const notificationId = notifications.result[0].id;

    // Http when
    const response = await agent
      .patch(`${NOTIFICATION_URL}/${notificationId}/read`)
      .set('Authorization', `Bearer ${likerToken}`);

    // Http then
    expect(response.status).toBe(HttpStatus.NOT_FOUND);
  });

  it('[200] 좋아요를 취소해 좋아요 수가 0이 되면 알림도 삭제된다.', async () => {
    // given
    await likeFeed(likerToken).expect(HttpStatus.CREATED);
    await waitFor(
      () => getUnreadCount(ownerToken),
      (result) => result.count > 0,
    );

    // Http when
    await unlikeFeed(likerToken).expect(HttpStatus.OK);

    // then
    const remaining = await waitFor(
      () => notificationRepository.findOneBy({ feed: { id: feed.id } } as any),
      (result) => result === null,
    );
    expect(remaining).toBeNull();
  });
});
