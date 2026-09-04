import {
  BaseEntity,
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';

import { User } from '@user/entity/user.entity';

export class RssInformation extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    length: 255,
    nullable: false,
  })
  name: string;

  @Column({
    name: 'user_name',
    length: 50,
    nullable: false,
  })
  userName: string;

  @Column({
    length: 255,
    nullable: false,
  })
  email: string;

  @Column({
    name: 'rss_url',
    length: 255,
    nullable: false,
  })
  rssUrl: string;

  @Column({
    name: 'blog_url',
    length: 255,
    nullable: false,
  })
  blogUrl: string;

  @Column({
    name: 'platform',
    length: 255,
    nullable: false,
  })
  blogPlatform: string;
}

@Entity({
  name: 'rss',
})
@Unique('UQ_rss_name', ['name'])
@Unique('UQ_rss_rss_url', ['rssUrl'])
export class Rss extends RssInformation {
  @Column({ name: 'name', nullable: false })
  name: string;

  @Column({ name: 'rss_url', length: 255, nullable: false })
  rssUrl: string;

  @Column({ name: 'image', type: 'text', nullable: true })
  blogImage: string | null;
}

@Entity({
  name: 'rss_reject',
})
export class RssReject extends RssInformation {
  @Column({
    length: 512,
    nullable: false,
  })
  description: string;

  @Column({ name: 'image', type: 'text', nullable: true })
  blogImage: string | null;
}

@Entity({
  name: 'rss_accept',
})
@Unique('UQ_rss_accept_name', ['name'])
@Unique('UQ_rss_accept_rss_url', ['rssUrl'])
export class RssAccept extends RssInformation {
  @Index('FT_rss_accept_name', { fulltext: true, parser: 'ngram' })
  @Column({ name: 'name', nullable: false })
  name: string;

  @Column({ name: 'rss_url', length: 255, nullable: false })
  rssUrl: string;

  @Column({ name: 'platform', default: 'etc', nullable: false })
  blogPlatform: string;

  @Column({ name: 'user_id', type: 'int', nullable: true })
  userId: number | null;

  @ManyToOne(() => User, {
    nullable: true,
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL',
  })
  @JoinColumn({
    name: 'user_id',
    foreignKeyConstraintName: 'FK_rss_accept_user_id',
  })
  user: User | null;

  @Column({ name: 'image', type: 'text', nullable: true })
  blogImage: string | null;

  @Column({ name: 'suspension_count', type: 'int', nullable: false, default: 0 })
  suspensionCount: number;

  static fromRss(rss: Rss) {
    const blog = new RssAccept();
    blog.name = rss.name;
    blog.userName = rss.userName;
    blog.email = rss.email;
    blog.rssUrl = rss.rssUrl;
    blog.blogUrl = rss.blogUrl;
    blog.blogPlatform = rss.blogPlatform;
    blog.blogImage = rss.blogImage;

    return blog;
  }
}
