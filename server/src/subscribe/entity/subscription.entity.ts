import {
  BaseEntity,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';

import { RssAccept } from '@rss/entity/rss.entity';

import { User } from '@user/entity/user.entity';

@Entity({ name: 'subscription' })
@Unique('UQ_subscription_user_rss', ['user', 'rssAccept'])
export class Subscription extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => RssAccept, (rssAccept) => rssAccept.id, {
    nullable: false,
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'rss_accept_id',
    foreignKeyConstraintName: 'FK_subscription_rss',
  })
  rssAccept: RssAccept;

  @ManyToOne(() => User, (user) => user.id, {
    nullable: false,
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'user_id',
    foreignKeyConstraintName: 'FK_subscription_user',
  })
  user: User;

  @CreateDateColumn({
    name: 'subscribed_at',
    type: 'datetime',
    nullable: false,
  })
  subscribedAt: Date;
}
