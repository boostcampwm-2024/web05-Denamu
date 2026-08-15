import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';

import { In } from 'typeorm';

import { Payload } from '@common/guard/jwt.guard';

import { FeedRepository } from '@feed/repository/feed.repository';

import { RssAccept } from '@rss/entity/rss.entity';
import { RssAcceptRepository } from '@rss/repository/rss.repository';

import { GetSubscribersRequestDto } from '@subscribe/dto/request/getSubscribers.dto';
import { ManageSubscriptionRequestDto } from '@subscribe/dto/request/manageSubscription.dto';
import {
  GetMySubscriptionsResponseDto,
  SubscribedRssResponseDto,
} from '@subscribe/dto/response/getMySubscriptions.dto';
import { GetSubscribersResponseDto } from '@subscribe/dto/response/getSubscribers.dto';
import { GetSubscriptionResponseDto } from '@subscribe/dto/response/getSubscription.dto';
import { SubscriptionCreatedEvent } from '@subscribe/event/subscription-created.event';
import { SubscriptionDeletedEvent } from '@subscribe/event/subscription-deleted.event';
import { SubscriptionRepository } from '@subscribe/repository/subscription.repository';

@Injectable()
export class SubscriptionService {
  constructor(
    private readonly subscriptionRepository: SubscriptionRepository,
    private readonly rssAcceptRepository: RssAcceptRepository,
    private readonly feedRepository: FeedRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  private async getRssAccept(rssId: number): Promise<RssAccept> {
    const rss = await this.rssAcceptRepository.findOneBy({ id: rssId });
    if (!rss) {
      throw new NotFoundException('존재하지 않는 RSS입니다.');
    }
    return rss;
  }

  async getStatus(user: Payload | null, dto: ManageSubscriptionRequestDto) {
    const rss = await this.getRssAccept(dto.rssId);

    let isSubscribed = false;
    if (user) {
      const subscription = await this.subscriptionRepository.findOneBy({
        user: { id: user.id },
        rssAccept: { id: rss.id },
      });
      isSubscribed = !!subscription;
    }

    const subscriberCount = await this.subscriptionRepository.countByBlogId(
      rss.id,
    );

    return GetSubscriptionResponseDto.toResponseDto(
      isSubscribed,
      subscriberCount,
    );
  }

  async create(user: Payload, dto: ManageSubscriptionRequestDto) {
    const rss = await this.getRssAccept(dto.rssId);

    if (rss.userId === user.id) {
      throw new ForbiddenException('본인 소유 블로그는 구독할 수 없습니다.');
    }

    const existing = await this.subscriptionRepository.findOneBy({
      user: { id: user.id },
      rssAccept: { id: rss.id },
    });
    if (existing) {
      throw new ConflictException('이미 구독한 블로그입니다.');
    }

    try {
      await this.subscriptionRepository.save({
        user: { id: user.id },
        rssAccept: { id: rss.id },
      });
    } catch (error) {
      if ((error as { code?: string })?.code === 'ER_DUP_ENTRY') {
        throw new ConflictException('이미 구독한 블로그입니다.');
      }
      throw error;
    }

    this.eventEmitter.emit(
      'subscription.created',
      new SubscriptionCreatedEvent(rss.id, user.id, rss.userId),
    );
  }

  async delete(user: Payload, dto: ManageSubscriptionRequestDto) {
    const rss = await this.getRssAccept(dto.rssId);

    const existing = await this.subscriptionRepository.findOneBy({
      user: { id: user.id },
      rssAccept: { id: rss.id },
    });
    if (!existing) {
      throw new NotFoundException('구독하지 않은 블로그입니다.');
    }

    await this.subscriptionRepository.delete({
      user: { id: user.id },
      rssAccept: { id: rss.id },
    });

    this.eventEmitter.emit(
      'subscription.deleted',
      new SubscriptionDeletedEvent(rss.id, user.id),
    );
  }

  async getSubscribers(
    user: Payload,
    dto: ManageSubscriptionRequestDto,
    query: GetSubscribersRequestDto,
  ) {
    const rss = await this.getRssAccept(dto.rssId);

    if (rss.userId !== user.id) {
      throw new ForbiddenException(
        '본인 소유 RSS의 구독자만 조회할 수 있습니다.',
      );
    }

    const subscribers = await this.subscriptionRepository.getSubscribersByBlog(
      rss.id,
      query.lastId,
      query.limit,
    );

    const hasMore = subscribers.length > query.limit;
    if (hasMore) subscribers.pop();
    const lastId = subscribers.length
      ? subscribers[subscribers.length - 1].id
      : 0;

    return GetSubscribersResponseDto.toResponseDto(
      subscribers,
      lastId,
      hasMore,
    );
  }

  async getUserSubscriptions(
    userId: number,
  ): Promise<GetMySubscriptionsResponseDto> {
    const blogIds =
      await this.subscriptionRepository.getSubscribedBlogIds(userId);
    if (!blogIds.length) return [];

    const rssList = await this.rssAcceptRepository.find({
      where: { id: In(blogIds) },
      order: { id: 'DESC' },
    });
    const feedCountMap =
      await this.feedRepository.countPublicFeedsByBlogIds(blogIds);
    const subscriberCountMap =
      await this.subscriptionRepository.countByBlogIds(blogIds);

    return SubscribedRssResponseDto.toResponseDtoArray(
      rssList,
      feedCountMap,
      subscriberCountMap,
    );
  }
}
