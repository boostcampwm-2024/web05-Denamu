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
      .addSelect('feed.id', 'id')
      .addSelect('title', 'title')
      .addSelect('feed.path', 'path')
      .addSelect('feed.created_at', 'created_at')
      .addSelect('feed.thumbnail', 'thumbnail')
      .addSelect('feed.view_count', 'view_count')
      .addSelect('feed.summary', 'summary')
      .addSelect('rss_accept.name', 'blog_name')
      .addSelect('rss_accept.blog_platform', 'blog_platform')
      .addSelect(
        `(
          SELECT JSON_ARRAYAGG(t.tag)
          FROM (
            SELECT DISTINCT tag_map.tag AS tag
            FROM tag_map
            WHERE tag_map.feed_id = feed.id
          ) t
        )`,
        'tag',
      )
      .from(Feed, 'feed')
      .innerJoin(RssAccept, 'rss_accept', 'rss_accept.id = feed.blog_id')
      .groupBy('feed.id'),
  name: 'feed_view',
})
export class FeedView {
  @ViewColumn({
    name: 'order_id',
  })
  orderId: number;

  @ViewColumn({
    name: 'id',
  })
  feedId: number;

  @ViewColumn({
    name: 'title',
  })
  title: string;

  @ViewColumn({
    name: 'path',
  })
  path: string;

  @ViewColumn({
    name: 'created_at',
  })
  createdAt: Date;

  @ViewColumn({
    name: 'thumbnail',
  })
  thumbnail: string;

  @ViewColumn({
    name: 'view_count',
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
    name: 'summary',
  })
  summary: string;

  @ViewColumn({
    name: 'tag',
  })
  tag: string;
}
