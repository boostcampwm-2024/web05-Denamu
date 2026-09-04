import {
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';

import { EventEmitter2 } from '@nestjs/event-emitter';

import { Payload } from '@common/guard/jwt.guard';

import { FeedRepository } from '@feed/repository/feed.repository';

import { RssAccept } from '@rss/entity/rss.entity';
import { RssAcceptRepository } from '@rss/repository/rss.repository';

import {
  GetMySubscriptionsResponseDto,
  SubscribedRssResponseDto,
} from '@subscribe/dto/response/getMySubscriptions.dto';
import { GetSubscriptionResponseDto } from '@subscribe/dto/response/getSubscription.dto';
import { Subscription } from '@subscribe/entity/subscription.entity';
import { SubscriptionRepository } from '@subscribe/repository/subscription.repository';
import { SubscriptionService } from '@subscribe/service/subscription.service';

describe(`${SubscriptionService.name} Unit Test`, () => {
  let subscriptionService: SubscriptionService;
  let subscriptionRepository: jest.Mocked<
    Pick<
      SubscriptionRepository,
      | 'findOneBy'
      | 'countByBlogId'
      | 'countByBlogIds'
      | 'save'
      | 'delete'
      | 'getSubscribersByBlog'
      | 'getSubscribedBlogIds'
    >
  >;
  let rssAcceptRepository: jest.Mocked<Pick<RssAcceptRepository, 'findOneBy' | 'find'>>;
  let feedRepository: jest.Mocked<Pick<FeedRepository, 'countPublicFeedsByBlogIds'>>;
  let eventEmitter: jest.Mocked<Pick<EventEmitter2, 'emit'>>;

  const viewer: Payload = {
    id: 1,
    email: 'viewer@test.com',
    userName: 'viewer',
    role: 'user',
  };

  const makeRss = (overwrites: Partial<RssAccept> = {}): RssAccept =>
    ({ id: 10, userId: 99, name: 'blog', ...overwrites }) as RssAccept;

  beforeEach(() => {
    subscriptionRepository = {
      findOneBy: jest.fn(),
      countByBlogId: jest.fn().mockResolvedValue(0),
      countByBlogIds: jest.fn().mockResolvedValue(new Map()),
      save: jest.fn(),
      delete: jest.fn(),
      getSubscribersByBlog: jest.fn(),
      getSubscribedBlogIds: jest.fn().mockResolvedValue([]),
    };
    rssAcceptRepository = { findOneBy: jest.fn(), find: jest.fn() };
    feedRepository = {
      countPublicFeedsByBlogIds: jest.fn().mockResolvedValue(new Map()),
    };
    eventEmitter = { emit: jest.fn() };

    subscriptionService = new SubscriptionService(
      subscriptionRepository as unknown as SubscriptionRepository,
      rssAcceptRepository as unknown as RssAcceptRepository,
      feedRepository as unknown as FeedRepository,
      eventEmitter as unknown as EventEmitter2,
    );
  });

  describe('getStatus', () => {
    it('존재하지 않는 RSS면 NotFoundException을 던진다.', async () => {
      rssAcceptRepository.findOneBy.mockResolvedValue(null);
      await expect(
        subscriptionService.getStatus(viewer, { rssId: 10 }),
      ).rejects.toThrow(NotFoundException);
    });

    it('비로그인(user=null)이면 구독 조회 없이 isSubscribed=false와 구독자 수를 반환한다.', async () => {
      // given
      rssAcceptRepository.findOneBy.mockResolvedValue(makeRss());
      subscriptionRepository.countByBlogId.mockResolvedValue(5);

      // when
      const result = await subscriptionService.getStatus(null, { rssId: 10 });

      // then
      expect(subscriptionRepository.findOneBy).not.toHaveBeenCalled();
      expect(result).toEqual(
        GetSubscriptionResponseDto.toResponseDto(false, 5),
      );
    });

    it('로그인 + 구독 중이면 isSubscribed=true를 반환한다.', async () => {
      // given
      rssAcceptRepository.findOneBy.mockResolvedValue(makeRss());
      subscriptionRepository.findOneBy.mockResolvedValue({ id: 1 } as Subscription);
      subscriptionRepository.countByBlogId.mockResolvedValue(3);

      // when
      const result = await subscriptionService.getStatus(viewer, { rssId: 10 });

      // then
      expect(result).toEqual(GetSubscriptionResponseDto.toResponseDto(true, 3));
    });

    it('로그인했지만 구독하지 않았으면 isSubscribed=false를 반환한다.', async () => {
      // given
      rssAcceptRepository.findOneBy.mockResolvedValue(makeRss());
      subscriptionRepository.findOneBy.mockResolvedValue(null);
      subscriptionRepository.countByBlogId.mockResolvedValue(3);

      // when
      const result = await subscriptionService.getStatus(viewer, { rssId: 10 });

      // then
      expect(result.isSubscribed).toBe(false);
    });
  });

  describe('create', () => {
    it('존재하지 않는 RSS면 NotFoundException을 던지고 저장하지 않는다.', async () => {
      rssAcceptRepository.findOneBy.mockResolvedValue(null);
      await expect(
        subscriptionService.create(viewer, { rssId: 10 }),
      ).rejects.toThrow(NotFoundException);
      expect(subscriptionRepository.save).not.toHaveBeenCalled();
    });

    it('본인 소유 RSS면 ForbiddenException을 던지고 저장하지 않는다.', async () => {
      rssAcceptRepository.findOneBy.mockResolvedValue(
        makeRss({ userId: viewer.id }),
      );
      await expect(
        subscriptionService.create(viewer, { rssId: 10 }),
      ).rejects.toThrow(ForbiddenException);
      expect(subscriptionRepository.save).not.toHaveBeenCalled();
    });

    it('이미 구독 중이면 ConflictException을 던지고 저장하지 않는다.', async () => {
      rssAcceptRepository.findOneBy.mockResolvedValue(makeRss());
      subscriptionRepository.findOneBy.mockResolvedValue({ id: 1 } as Subscription);
      await expect(
        subscriptionService.create(viewer, { rssId: 10 }),
      ).rejects.toThrow(ConflictException);
      expect(subscriptionRepository.save).not.toHaveBeenCalled();
    });

    it('구독한 적 없으면 user와 rssAccept 연관으로 저장한다.', async () => {
      // given
      rssAcceptRepository.findOneBy.mockResolvedValue(makeRss());
      subscriptionRepository.findOneBy.mockResolvedValue(null);

      // when
      await subscriptionService.create(viewer, { rssId: 10 });

      // then
      expect(subscriptionRepository.save).toHaveBeenCalledWith({
        user: { id: viewer.id },
        rssAccept: { id: 10 },
      });
      expect(eventEmitter.emit).toHaveBeenCalledWith(
        'subscription.created',
        expect.objectContaining({ rssId: 10, subscriberUserId: viewer.id, ownerUserId: 99 }),
      );
    });

    it('소유자가 없는 RSS를 구독하면 ownerUserId가 null인 이벤트를 발행한다.', async () => {
      // given
      rssAcceptRepository.findOneBy.mockResolvedValue(makeRss({ userId: null }));
      subscriptionRepository.findOneBy.mockResolvedValue(null);

      // when
      await subscriptionService.create(viewer, { rssId: 10 });

      // then
      expect(eventEmitter.emit).toHaveBeenCalledWith(
        'subscription.created',
        expect.objectContaining({ rssId: 10, subscriberUserId: viewer.id, ownerUserId: null }),
      );
    });

    it('사전 조회를 통과해도 저장 시 unique 제약 위반(ER_DUP_ENTRY)이면 ConflictException으로 변환한다.', async () => {
      // given: 사전 조회는 비어 있지만(TOCTOU) 동시 요청으로 저장 시점에 중복이 발생하는 경합 상황
      rssAcceptRepository.findOneBy.mockResolvedValue(makeRss());
      subscriptionRepository.findOneBy.mockResolvedValue(null);
      subscriptionRepository.save.mockRejectedValue({ code: 'ER_DUP_ENTRY' });

      // when & then
      await expect(
        subscriptionService.create(viewer, { rssId: 10 }),
      ).rejects.toThrow(ConflictException);
      expect(eventEmitter.emit).not.toHaveBeenCalled();
    });
  });

  describe('delete', () => {
    it('존재하지 않는 RSS면 NotFoundException을 던진다.', async () => {
      rssAcceptRepository.findOneBy.mockResolvedValue(null);
      await expect(
        subscriptionService.delete(viewer, { rssId: 10 }),
      ).rejects.toThrow(NotFoundException);
      expect(subscriptionRepository.delete).not.toHaveBeenCalled();
    });

    it('구독하지 않은 RSS면 NotFoundException을 던지고 삭제하지 않는다.', async () => {
      rssAcceptRepository.findOneBy.mockResolvedValue(makeRss());
      subscriptionRepository.findOneBy.mockResolvedValue(null);
      await expect(
        subscriptionService.delete(viewer, { rssId: 10 }),
      ).rejects.toThrow(NotFoundException);
      expect(subscriptionRepository.delete).not.toHaveBeenCalled();
    });

    it('구독 중이면 user·rssAccept 기준으로 삭제한다.', async () => {
      // given
      rssAcceptRepository.findOneBy.mockResolvedValue(makeRss());
      subscriptionRepository.findOneBy.mockResolvedValue({ id: 1 } as Subscription);

      // when
      await subscriptionService.delete(viewer, { rssId: 10 });

      // then
      expect(subscriptionRepository.delete).toHaveBeenCalledWith({
        user: { id: viewer.id },
        rssAccept: { id: 10 },
      });
      expect(eventEmitter.emit).toHaveBeenCalledWith(
        'subscription.deleted',
        expect.objectContaining({ rssId: 10, subscriberUserId: viewer.id }),
      );
    });
  });

  describe('getSubscribers', () => {
    const makeSubscription = (id: number): Subscription =>
      ({
        id,
        user: { id: id + 100, userName: `u${id}`, profileImage: null },
      }) as unknown as Subscription;

    it('본인 소유가 아닌 RSS면 ForbiddenException을 던진다.', async () => {
      rssAcceptRepository.findOneBy.mockResolvedValue(makeRss({ userId: 99 }));
      await expect(
        subscriptionService.getSubscribers(viewer, { rssId: 10 }, { limit: 10 }),
      ).rejects.toThrow(ForbiddenException);
      expect(subscriptionRepository.getSubscribersByBlog).not.toHaveBeenCalled();
    });

    it('limit보다 많이 조회되면 마지막 항목을 잘라내고 hasMore=true로 반환한다.', async () => {
      // given (limit=2인데 3개 조회 → 다음 페이지 존재)
      rssAcceptRepository.findOneBy.mockResolvedValue(makeRss({ userId: viewer.id }));
      subscriptionRepository.getSubscribersByBlog.mockResolvedValue([
        makeSubscription(5),
        makeSubscription(4),
        makeSubscription(3),
      ]);

      // when
      const result = await subscriptionService.getSubscribers(
        viewer,
        { rssId: 10 },
        { lastId: 6, limit: 2 },
      );

      // then
      expect(subscriptionRepository.getSubscribersByBlog).toHaveBeenCalledWith(
        10,
        6,
        2,
      );
      expect(result.result).toHaveLength(2);
      expect(result.hasMore).toBe(true);
      expect(result.lastId).toBe(4);
    });

    it('limit 이하로 조회되면 hasMore=false로 반환한다.', async () => {
      // given
      rssAcceptRepository.findOneBy.mockResolvedValue(makeRss({ userId: viewer.id }));
      subscriptionRepository.getSubscribersByBlog.mockResolvedValue([
        makeSubscription(3),
      ]);

      // when
      const result = await subscriptionService.getSubscribers(
        viewer,
        { rssId: 10 },
        { limit: 10 },
      );

      // then
      expect(result.hasMore).toBe(false);
      expect(result.lastId).toBe(3);
    });

    it('구독자가 없으면 lastId=0, hasMore=false로 반환한다.', async () => {
      // given
      rssAcceptRepository.findOneBy.mockResolvedValue(makeRss({ userId: viewer.id }));
      subscriptionRepository.getSubscribersByBlog.mockResolvedValue([]);

      // when
      const result = await subscriptionService.getSubscribers(
        viewer,
        { rssId: 10 },
        { limit: 10 },
      );

      // then
      expect(result.result).toHaveLength(0);
      expect(result.lastId).toBe(0);
      expect(result.hasMore).toBe(false);
    });
  });

  describe('getUserSubscriptions', () => {
    it('구독한 블로그가 없으면 RSS 조회 없이 빈 배열을 반환한다.', async () => {
      // given
      subscriptionRepository.getSubscribedBlogIds.mockResolvedValue([]);

      // when
      const result = await subscriptionService.getUserSubscriptions(1);

      // then
      expect(result).toEqual([]);
      expect(rssAcceptRepository.find).not.toHaveBeenCalled();
    });

    it('구독한 블로그를 공개 게시글 수와 함께 응답으로 변환한다.', async () => {
      // given
      const blogIds = [7];
      const rssList = [makeRss({ id: 7 })];
      const feedCountMap = new Map<number, number>([[7, 4]]);
      const subscriberCountMap = new Map<number, number>([[7, 2]]);
      subscriptionRepository.getSubscribedBlogIds.mockResolvedValue(blogIds);
      rssAcceptRepository.find.mockResolvedValue(rssList);
      feedRepository.countPublicFeedsByBlogIds.mockResolvedValue(feedCountMap);
      subscriptionRepository.countByBlogIds.mockResolvedValue(
        subscriberCountMap,
      );

      // when
      const result = await subscriptionService.getUserSubscriptions(1);

      // then
      expect(feedRepository.countPublicFeedsByBlogIds).toHaveBeenCalledWith(
        blogIds,
      );
      expect(result).toEqual<GetMySubscriptionsResponseDto>(
        SubscribedRssResponseDto.toResponseDtoArray(
          rssList,
          feedCountMap,
          subscriberCountMap,
        ),
      );
      expect(result[0].feedCount).toBe(4);
      expect(result[0].subscriberCount).toBe(2);
    });
  });
});
