import { Injectable } from '@nestjs/common';

import { DataSource, LessThan, MoreThanOrEqual, Repository } from 'typeorm';

import { Feed } from '@feed/entity/feed.entity';

import { Notification, NotificationType } from '@notification/entity/notification.entity';
import { getNotificationCutoffDate } from '@notification/constant/notification.constant';

import { RssAccept } from '@rss/entity/rss.entity';

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

  async upsertReply(recipientId: number, feedId: number) {
    await this.createQueryBuilder()
      .insert()
      .into(Notification)
      .values({
        recipient: { id: recipientId } as User,
        type: NotificationType.REPLY,
        feed: { id: feedId } as Feed,
        isRead: false,
      })
      .orUpdate(['is_read', 'updated_at'], ['recipient_user_id', 'type', 'feed_id'])
      .execute();
  }

  async deleteReplyNotification(feedId: number, recipientId: number) {
    await this.delete({
      type: NotificationType.REPLY,
      feed: { id: feedId },
      recipient: { id: recipientId } as User,
    });
  }

  async hasActiveOtherReply(feedId: number, recipientId: number) {
    const row = await this.dataSource
      .createQueryBuilder()
      .select('COUNT(*)', 'count')
      .from('comment', 'r')
      .innerJoin('comment', 'p', 'p.id = r.parent_id')
      .where('r.feed_id = :feedId', { feedId })
      .andWhere('r.is_deleted = 0')
      .andWhere('r.user_id != :recipientId', { recipientId })
      .andWhere('p.user_id = :recipientId', { recipientId })
      .getRawOne<{ count: string }>();

    return Number(row?.count ?? 0) > 0;
  }

  async upsertSubscribe(recipientId: number, rssAcceptId: number) {
    await this.createQueryBuilder()
      .insert()
      .into(Notification)
      .values({
        recipient: { id: recipientId } as User,
        type: NotificationType.SUBSCRIBE,
        rssAccept: { id: rssAcceptId } as RssAccept,
        isRead: false,
      })
      .orUpdate(['is_read', 'updated_at'], ['recipient_user_id', 'type', 'rss_accept_id'])
      .execute();
  }

  async deleteSubscribeNotification(rssAcceptId: number) {
    await this.delete({ type: NotificationType.SUBSCRIBE, rssAccept: { id: rssAcceptId } });
  }

  async findByRecipient(recipientId: number, limit: number) {
    return this.createQueryBuilder('n')
      .leftJoin('n.feed', 'feed')
      .leftJoin('n.rssAccept', 'rss')
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
        'comment',
        'latest_reply',
        "n.type = 'REPLY' AND latest_reply.id = (SELECT r2.id FROM `comment` r2 INNER JOIN `comment` p2 ON p2.id = r2.parent_id WHERE r2.feed_id = n.feed_id AND r2.is_deleted = 0 AND r2.user_id != n.recipient_user_id AND p2.user_id = n.recipient_user_id ORDER BY r2.date DESC LIMIT 1)",
      )
      .leftJoin(
        'subscription',
        'latest_subscription',
        'latest_subscription.id = (SELECT s2.id FROM subscription s2 WHERE s2.rss_accept_id = n.rss_accept_id ORDER BY s2.id DESC LIMIT 1)',
      )
      .leftJoin('user', 'like_actor', 'like_actor.id = latest_like.user_id')
      .leftJoin('user', 'comment_actor', 'comment_actor.id = latest_comment.user_id')
      .leftJoin('user', 'reply_actor', 'reply_actor.id = latest_reply.user_id')
      .leftJoin('user', 'subscribe_actor', 'subscribe_actor.id = latest_subscription.user_id')
      .select('n.id', 'id')
      .addSelect('n.type', 'type')
      .addSelect('n.is_read', 'isRead')
      .addSelect('n.updated_at', 'updatedAt')
      .addSelect('feed.id', 'feedId')
      .addSelect('feed.title', 'feedTitle')
      .addSelect('feed.path', 'feedPath')
      .addSelect('rss.id', 'rssId')
      .addSelect('rss.name', 'rssName')
      .addSelect(
        'COALESCE(like_actor.user_name, comment_actor.user_name, reply_actor.user_name, subscribe_actor.user_name)',
        'actorUserName',
      )
      .addSelect(
        'COALESCE(like_actor.profile_image, comment_actor.profile_image, reply_actor.profile_image, subscribe_actor.profile_image)',
        'actorProfileImage',
      )
      .addSelect('COALESCE(latest_comment.comment, latest_reply.comment)', 'commentContent')
      .addSelect('COALESCE(latest_comment.id, latest_reply.id)', 'commentId')
      .addSelect(
        `CASE n.type
          WHEN 'LIKE' THEN (SELECT COUNT(*) FROM likes l3 WHERE l3.feed_id = n.feed_id AND l3.user_id != n.recipient_user_id)
          WHEN 'COMMENT' THEN (SELECT COUNT(DISTINCT c3.user_id) FROM \`comment\` c3 WHERE c3.feed_id = n.feed_id AND c3.is_deleted = 0 AND c3.user_id != n.recipient_user_id)
          WHEN 'REPLY' THEN (SELECT COUNT(DISTINCT r3.user_id) FROM \`comment\` r3 INNER JOIN \`comment\` p3 ON p3.id = r3.parent_id WHERE r3.feed_id = n.feed_id AND r3.is_deleted = 0 AND r3.user_id != n.recipient_user_id AND p3.user_id = n.recipient_user_id)
          WHEN 'SUBSCRIBE' THEN (SELECT COUNT(*) FROM subscription s3 WHERE s3.rss_accept_id = n.rss_accept_id AND s3.user_id != n.recipient_user_id)
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
    return this.count({
      where: {
        recipient: { id: recipientId } as User,
        isRead: false,
        updatedAt: MoreThanOrEqual(getNotificationCutoffDate()),
      },
    });
  }

  async markRead(id: number, recipientId: number) {
    const result = await this.update(
      { id, recipient: { id: recipientId } as User },
      { isRead: true },
    );

    return (result.affected ?? 0) > 0;
  }

  async deleteExpired() {
    return this.delete({ updatedAt: LessThan(getNotificationCutoffDate()) });
  }
}
