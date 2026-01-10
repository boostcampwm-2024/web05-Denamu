import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { Feed } from '@feed/entity/feed.entity';

import { User } from '@user/entity/user.entity';

@Entity({ name: 'comment' })
export class Comment extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    name: 'comment',
    nullable: false,
    type: 'text',
  })
  comment: string;

  @CreateDateColumn({
    name: 'date',
    nullable: false,
  })
  date: Date;

  @ManyToOne(() => Feed, (feed) => feed.id, {
    nullable: false,
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'feed_id',
  })
  feed: Feed;

  @ManyToOne(() => User, (user) => user.id, {
    nullable: false,
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'user_id',
  })
  user: User;
}
