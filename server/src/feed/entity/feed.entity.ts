import {
  BaseEntity,
  Column,
  DataSource,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  ViewColumn,
  ViewEntity,
} from 'typeorm';
import { RssAccept } from '../../rss/entity/rss.entity';
import { TagMap } from './tag-map.entity';

@Entity({ name: 'feed' })
export class Feed extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    name: 'created_at',
    type: 'datetime',
    nullable: false,
  })
  @Index()
  createdAt: Date;

  @Index({ fulltext: true, parser: 'ngram' })
  @Column({ name: 'title', nullable: false })
  title: string;

  @Column({ name: 'view_count', nullable: false, default: 0 })
  viewCount: number;

  @Column({
    length: 512,
    nullable: false,
    unique: true,
  })
  path: string;

  @Column({
    length: 255,
    nullable: true,
  })
  thumbnail: string;

  @Column({
    type: 'text',
    nullable: true,
  })
  summary: string;

  @ManyToOne(() => RssAccept, (rssAccept) => rssAccept.feeds, {
    nullable: false,
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'blog_id',
  })
  blog: RssAccept;

  @OneToMany(() => TagMap, (tag) => tag.feed)
  tag: TagMap[];
}

@ViewEntity({
  expression: (dataSource: DataSource) =>
    dataSource
      .createQueryBuilder()
      .select()
      .addSelect('ROW_NUMBER() OVER (ORDER BY feed.created_at) AS order_id')
      .addSelect('feed.id', 'feed_id')
      .addSelect('title', 'feed_title')
      .addSelect('feed.path', 'feed_path')
      .addSelect('feed.created_at', 'feed_created_at')
      .addSelect('feed.thumbnail', 'feed_thumbnail')
      .addSelect('feed.view_count', 'feed_view_count')
      .addSelect('feed.summary', 'feed_summary')
      .addSelect('rss_accept.name', 'blog_name')
      .addSelect('rss_accept.blog_platform', 'blog_platform')
      .addSelect('GROUP_CONCAT(DISTINCT tag_map.tag)', 'feed_tag')
      .from(Feed, 'feed')
      .innerJoin(RssAccept, 'rss_accept', 'rss_accept.id = feed.blog_id')
      .leftJoin(TagMap, 'tag_map', 'tag_map.feed_id = feed.id')
      .groupBy('feed.id')
      .orderBy('feed_created_at'),
  name: 'feed_view',
})
export class FeedView {
  @ViewColumn({
    name: 'order_id',
  })
  orderId: number;

  @ViewColumn({
    name: 'feed_id',
  })
  feedId: number;

  @ViewColumn({
    name: 'feed_title',
  })
  title: string;

  @ViewColumn({
    name: 'feed_path',
  })
  path: string;

  @ViewColumn({
    name: 'feed_created_at',
  })
  createdAt: Date;

  @ViewColumn({
    name: 'feed_thumbnail',
  })
  thumbnail: string;

  @ViewColumn({
    name: 'feed_view_count',
  })
  viewCount: number;

  @ViewColumn({
    name: 'blog_name',
  })
  blogName: string;

  @ViewColumn({
    name: 'blog_platform',
  })
  blogPlatform: string;

  @ViewColumn({
    name: 'feed_summary',
  })
  summary: string;

  @ViewColumn({
    name: 'feed_tag',
  })
  tag: string;
}
