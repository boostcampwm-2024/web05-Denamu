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

import { User } from '@user/entity/user.entity';

export enum NotificationType {
  LIKE = 'LIKE',
}

@Entity({ name: 'notification' })
@Unique(['recipient', 'type', 'feed'])
export class Notification extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, {
    nullable: false,
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'recipient_user_id' })
  recipient: User;

  @Column({
    name: 'type',
    type: 'varchar',
    length: 20,
  })
  type: NotificationType;

  @ManyToOne(() => Feed, {
    nullable: false,
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'feed_id' })
  feed: Feed;

  @Column({ name: 'is_read', default: false })
  isRead: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Index()
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
