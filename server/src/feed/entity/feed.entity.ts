import {
  BaseEntity,
  Column,
  DataSource,
  Entity,
  Index,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
  ViewColumn,
  ViewEntity,
} from 'typeorm';
import { RssAccept } from '../../rss/entity/rss.entity';
import { Tag } from '../../tag/entity/tag.entity';

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

  @ManyToMany(() => Tag, (tag) => tag.feeds, { cascade: true })
  @JoinTable({
    name: 'tag_map',
    joinColumn: { name: 'feed_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'tag_id', referencedColumnName: 'id' },
  })
  tags: Tag[];
}

@ViewEntity({
  expression: (dataSource: DataSource) =>
    dataSource
      .createQueryBuilder()
      .select()
      .addSelect('ROW_NUMBER() OVER (ORDER BY f.created_at)', 'order_id')
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
          SELECT JSON_ARRAYAGG(t.name)
          FROM tag_map tm
          INNER JOIN tag t ON t.id = tm.tag_id
          WHERE tm.feed_id = f.id
        )`,
        'tag',
      )
      .from(Feed, 'f')
      .innerJoin(RssAccept, 'r', 'r.id = f.blog_id')
      .groupBy('f.id'),
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
  tag: string[];
}
