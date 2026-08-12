import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';

import { Feed } from '@feed/entity/feed.entity';

import { RssAccept } from '@rss/entity/rss.entity';

import { User } from '@user/entity/user.entity';

export enum NotificationType {
  LIKE = 'LIKE',
  COMMENT = 'COMMENT',
  REPLY = 'REPLY',
  SUBSCRIBE = 'SUBSCRIBE',
  NEW_POST = 'NEW_POST',
}

@Entity({ name: 'notification' })
@Unique('UQ_notification_recipient_user_id_type_feed_id', [
  'recipient',
  'type',
  'feed',
])
@Unique('IDX_notification_recipient_type_rss_accept', [
  'recipient',
  'type',
  'rssAccept',
])
export class Notification extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, {
    nullable: false,
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'recipient_user_id',
    foreignKeyConstraintName: 'FK_notification_recipient_user_id',
  })
  recipient: User;

  @Column({
    name: 'type',
    type: 'varchar',
    length: 20,
  })
  type: NotificationType;

  @ManyToOne(() => Feed, {
    nullable: true,
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'feed_id',
    foreignKeyConstraintName: 'FK_notification_feed_id',
  })
  feed: Feed | null;

  @ManyToOne(() => RssAccept, {
    nullable: true,
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'rss_accept_id',
    foreignKeyConstraintName: 'FK_notification_rss_accept_id',
  })
  rssAccept: RssAccept | null;

  @Column({ name: 'is_read', default: false })
  isRead: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Index('IDX_notification_updated_at')
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
