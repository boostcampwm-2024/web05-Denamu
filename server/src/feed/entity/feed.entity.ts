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
  Unique,
  ViewColumn,
  ViewEntity,
} from 'typeorm';

import { RssAccept } from '@rss/entity/rss.entity';

import { Tag } from '@tag/entity/tag.entity';

@Entity({ name: 'feed' })
@Unique('UQ_feed_path', ['path'])
export class Feed extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    name: 'created_at',
    type: 'datetime',
    nullable: false,
  })
  @Index('IDX_feed_created_at')
  createdAt: Date;

  @Index('FT_feed_title', { fulltext: true, parser: 'ngram' })
  @Column({ name: 'title', nullable: false })
  title: string;

  @Column({ name: 'view_count', nullable: false, default: 0 })
  viewCount: number;

  @Column({
    length: 512,
    nullable: false,
  })
  path: string;

  @Column({
    type: 'text',
    nullable: true,
  })
  thumbnail: string;

  @Column({
    type: 'text',
    nullable: true,
  })
  summary: string;

  @Column({
    name: 'like_count',
    nullable: false,
    default: 0,
  })
  likeCount: number;

  @Column({
    name: 'comment_count',
    nullable: false,
    default: 0,
  })
  commentCount: number;

  @Column({
    name: 'is_public',
    nullable: false,
    default: true,
  })
  isPublic: boolean;

  @ManyToOne(() => RssAccept, {
    nullable: false,
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'blog_id',
    foreignKeyConstraintName: 'FK_feed_blog_id',
  })
  blog: RssAccept;

  @ManyToMany(() => Tag, { cascade: true })
  @JoinTable({
    name: 'tag_map',
    joinColumn: {
      name: 'feed_id',
      referencedColumnName: 'id',
      foreignKeyConstraintName: 'FK_tag_map_feed_id',
    },
    inverseJoinColumn: {
      name: 'tag_id',
      referencedColumnName: 'id',
      foreignKeyConstraintName: 'FK_tag_map_tag_id',
    },
  })
  tags: Tag[];
}

@ViewEntity({
  expression: (dataSource: DataSource) =>
    dataSource
      .createQueryBuilder()
      .select()
      .addSelect('ROW_NUMBER() OVER (ORDER BY f.created_at)', 'order_id')
      .addSelect('f.id', 'id')
      .addSelect('title', 'title')
      .addSelect('f.path', 'path')
      .addSelect('f.created_at', 'created_at')
      .addSelect('f.thumbnail', 'thumbnail')
      .addSelect('f.view_count', 'view_count')
      .addSelect('f.summary', 'summary')
      .addSelect('f.like_count', 'like_count')
      .addSelect('f.comment_count', 'comment_count')
      .addSelect('r.name', 'blog_name')
      .addSelect('r.platform', 'blog_platform')
      .addSelect('r.image', 'blog_image')
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
      .where('f.is_public = 1')
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
    name: 'blog_image',
  })
  blogImage: string | null;

  @ViewColumn({
    name: 'summary',
  })
  summary: string;

  @ViewColumn({
    name: 'like_count',
  })
  likeCount: number;

  @ViewColumn({
    name: 'comment_count',
  })
  commentCount: number;

  @ViewColumn({
    name: 'tag',
  })
  tag: string[];
}
