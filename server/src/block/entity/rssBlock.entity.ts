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

@Entity({ name: 'rss_blocks' })
@Unique(['blocker', 'blockedRss'])
export class RssBlock extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.id, {
    nullable: false,
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'blocker_id',
  })
  blocker: User;

  @ManyToOne(() => RssAccept, (rssAccept) => rssAccept.id, {
    nullable: false,
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'blocked_rss_id',
  })
  blockedRss: RssAccept;

  @CreateDateColumn({
    name: 'created_at',
    type: 'datetime',
    nullable: false,
  })
  createdAt: Date;
}
