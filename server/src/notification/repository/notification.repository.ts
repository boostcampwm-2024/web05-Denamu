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
      .orUpdate(['is_read', 'updated_at'], ['recipient_user_id', 'type', 'feed_id'])
      .execute();
  }

  async deleteLikeNotification(feedId: number) {
    await this.delete({ type: NotificationType.LIKE, feed: { id: feedId } });
  }

  async upsertComment(recipientId: number, feedId: number) {
    await this.createQueryBuilder()
      .insert()
      .into(Notification)
      .values({
        recipient: { id: recipientId } as User,
        type: NotificationType.COMMENT,
        feed: { id: feedId } as Feed,
        isRead: false,
      })
      .orUpdate(['is_read', 'updated_at'], ['recipient_user_id', 'type', 'feed_id'])
      .execute();
  }

  async deleteCommentNotification(feedId: number) {
    await this.delete({ type: NotificationType.COMMENT, feed: { id: feedId } });
  }

  async hasActiveOtherComment(feedId: number, recipientId: number) {
    const row = await this.dataSource
      .createQueryBuilder()
      .select('COUNT(*)', 'count')
      .from('comment', 'c')
      .where('c.feed_id = :feedId', { feedId })
      .andWhere('c.is_deleted = 0')
      .andWhere('c.user_id != :recipientId', { recipientId })
      .getRawOne<{ count: string }>();

    return Number(row?.count ?? 0) > 0;
  }

  async findByRecipient(recipientId: number, limit: number) {
    return this.createQueryBuilder('n')
      .innerJoin('n.feed', 'feed')
      .leftJoin(
        'likes',
        'latest_like',
        "n.type = 'LIKE' AND latest_like.id = (SELECT l2.id FROM likes l2 WHERE l2.feed_id = n.feed_id ORDER BY l2.like_date DESC LIMIT 1)",
      )
      .leftJoin(
        'comment',
        'latest_comment',
        "n.type = 'COMMENT' AND latest_comment.id = (SELECT c2.id FROM `comment` c2 WHERE c2.feed_id = n.feed_id AND c2.is_deleted = 0 AND c2.user_id != n.recipient_user_id ORDER BY c2.date DESC LIMIT 1)",
      )
      .leftJoin(
        'user',
        'actor',
        'actor.id = COALESCE(latest_like.user_id, latest_comment.user_id)',
      )
      .select('n.id', 'id')
      .addSelect('n.type', 'type')
      .addSelect('n.is_read', 'isRead')
      .addSelect('n.updated_at', 'updatedAt')
      .addSelect('feed.id', 'feedId')
      .addSelect('feed.title', 'feedTitle')
      .addSelect('feed.path', 'feedPath')
      .addSelect('actor.user_name', 'actorUserName')
      .addSelect('actor.profile_image', 'actorProfileImage')
      .addSelect('latest_comment.comment', 'commentContent')
      .addSelect('latest_comment.id', 'commentId')
      .addSelect(
        `CASE n.type
          WHEN 'LIKE' THEN (SELECT COUNT(*) FROM likes l3 WHERE l3.feed_id = n.feed_id AND l3.user_id != n.recipient_user_id)
          WHEN 'COMMENT' THEN (SELECT COUNT(DISTINCT c3.user_id) FROM \`comment\` c3 WHERE c3.feed_id = n.feed_id AND c3.is_deleted = 0 AND c3.user_id != n.recipient_user_id)
          ELSE 0
        END`,
        'otherActorsCount',
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
