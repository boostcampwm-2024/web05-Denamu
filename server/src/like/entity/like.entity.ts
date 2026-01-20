import {
  BaseEntity,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';

import { Feed } from '@feed/entity/feed.entity';

import { User } from '@user/entity/user.entity';

@Entity({ name: 'likes' })
@Unique(['user', 'feed'])
export class Like extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

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

  @CreateDateColumn({
    name: 'like_date',
    type: 'datetime',
    nullable: false,
  })
  likeDate: Date;
}
