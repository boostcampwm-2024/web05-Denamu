import {
  BaseEntity,
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { Feed } from '@feed/entity/feed.entity';

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
export class Rss extends RssInformation {
  @Column({ name: 'name', nullable: false, unique: true })
  name: string;

  @Column({ name: 'rss_url', length: 255, nullable: false, unique: true })
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
export class RssAccept extends RssInformation {
  @OneToMany(() => Feed, (feed) => feed.blog)
  feeds: Feed[];

  @Index('FT_rss_accept_name', { fulltext: true, parser: 'ngram' })
  @Column({ name: 'name', nullable: false, unique: true })
  name: string;

  @Column({ name: 'rss_url', length: 255, nullable: false, unique: true })
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
  @JoinColumn({ name: 'user_id' })
  user: User | null;

  @Column({ name: 'image', type: 'text', nullable: true })
  blogImage: string | null;

  static fromRss(rss: Rss) {
    const blog = new RssAccept();
    blog.name = rss.name;
    blog.userName = rss.userName;
    blog.email = rss.email;
    blog.rssUrl = rss.rssUrl;
    blog.blogUrl = rss.blogUrl;
    blog.blogPlatform = rss.blogPlatform;
    blog.blogImage = rss.blogImage;
    blog.feeds = [];

    return blog;
  }
}
