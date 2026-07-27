import { Injectable } from '@nestjs/common';

import { DataSource, LessThan, Repository } from 'typeorm';

import { Feed } from '@feed/entity/feed.entity';

import { Notification, NotificationType } from '@notification/entity/notification.entity';
import { getNotificationCutoffDate } from '@notification/constant/notification.constant';

import { User } from '@user/entity/user.entity';

@Injectable()
export class NotificationRepository extends Repository<Notification> {
  constructor(private dataSource: DataSource) {
    super(Notification, dataSource.createEntityManager());
  }

  async upsertLike(recipientId: number, feedId: number) {
    await this.createQueryBuilder()
      .insert()
      .into(Notification)
      .values({
        recipient: { id: recipientId } as User,
        type: NotificationType.LIKE,
        feed: { id: feedId } as Feed,
        isRead: false,
      })
      .orUpdate(['is_read'], ['recipient_user_id', 'type', 'feed_id'])
      .execute();
  }

  async deleteLikeNotification(feedId: number) {
    await this.delete({ type: NotificationType.LIKE, feed: { id: feedId } });
  }

  async findByRecipient(recipientId: number, limit: number) {
    return this.createQueryBuilder('n')
      .innerJoin('n.feed', 'feed')
      .leftJoin(
        'likes',
        'latest_like',
        'latest_like.id = (SELECT l2.id FROM likes l2 WHERE l2.feed_id = n.feed_id ORDER BY l2.like_date DESC LIMIT 1)',
      )
      .leftJoin('user', 'actor', 'actor.id = latest_like.user_id')
      .select('n.id', 'id')
      .addSelect('n.type', 'type')
      .addSelect('n.is_read', 'isRead')
      .addSelect('n.updated_at', 'updatedAt')
      .addSelect('feed.id', 'feedId')
      .addSelect('feed.title', 'feedTitle')
      .addSelect('feed.path', 'feedPath')
      .addSelect('actor.user_name', 'actorUserName')
      .addSelect('actor.profile_image', 'actorProfileImage')
      .addSelect(
        '(SELECT COUNT(*) FROM likes l3 WHERE l3.feed_id = n.feed_id AND l3.user_id != n.recipient_user_id)',
        'otherLikersCount',
      )
      .where('n.recipient_user_id = :recipientId', { recipientId })
      .andWhere('n.updated_at >= :cutoff', { cutoff: getNotificationCutoffDate() })
      .orderBy('n.updated_at', 'DESC')
      .limit(limit)
      .getRawMany();
  }

  async countUnread(recipientId: number) {
    return this.createQueryBuilder('n')
      .where('n.recipient_user_id = :recipientId', { recipientId })
      .andWhere('n.is_read = 0')
      .andWhere('n.updated_at >= :cutoff', { cutoff: getNotificationCutoffDate() })
      .getCount();
  }

  async markRead(id: number, recipientId: number) {
    const result = await this.createQueryBuilder()
      .update(Notification)
      .set({ isRead: true })
      .where('id = :id', { id })
      .andWhere('recipient_user_id = :recipientId', { recipientId })
      .execute();

    return (result.affected ?? 0) > 0;
  }

  async deleteExpired() {
    return this.delete({ updatedAt: LessThan(getNotificationCutoffDate()) });
  }
}
