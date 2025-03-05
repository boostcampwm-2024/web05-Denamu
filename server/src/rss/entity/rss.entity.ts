import {
  BaseEntity,
  Column,
  Entity,
  PrimaryGeneratedColumn,
  Index,
  OneToMany,
} from 'typeorm';
import { Feed } from '../../feed/entity/feed.entity';

export abstract class RssInformation extends BaseEntity {
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
}

@Entity({
  name: 'rss',
})
export class Rss extends RssInformation {}

@Entity({
  name: 'rss_reject',
})
export class RssReject extends RssInformation {
  @Column({
    length: 512,
    nullable: false,
  })
  description: string;
}

@Entity({
  name: 'rss_accept',
})
export class RssAccept extends RssInformation {
  @OneToMany((type) => Feed, (feed) => feed.blog)
  feeds: Feed[];

  @Index({ fulltext: true, parser: 'ngram' })
  @Column({ name: 'name', nullable: false })
  name: string;

  @Column({ name: 'blog_platform', default: 'etc', nullable: false })
  blogPlatform: string;

  static fromRss(rss: Rss, blogPlatform: string) {
    const blog = new RssAccept();
    blog.name = rss.name;
    blog.userName = rss.userName;
    blog.email = rss.email;
    blog.rssUrl = rss.rssUrl;
    blog.blogPlatform = blogPlatform;
    blog.feeds = [];

    return blog;
  }
}
