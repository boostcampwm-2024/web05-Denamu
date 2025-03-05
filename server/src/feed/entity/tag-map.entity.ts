import {
  BaseEntity,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
} from 'typeorm';
import { Feed } from './feed.entity';

@Entity({ name: 'tag_map' })
export class TagMap extends BaseEntity {
  @PrimaryColumn({ name: 'feed_id', type: 'number' })
  @ManyToOne(() => Feed, (feed) => feed.tag, {
    nullable: false,
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'feed_id' })
  feed: Feed;

  @PrimaryColumn({
    name: 'tag',
    length: 50,
    nullable: false,
  })
  tag: string;
}
