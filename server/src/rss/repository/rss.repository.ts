import { Injectable } from '@nestjs/common';

import { DataSource, Repository } from 'typeorm';

import { Rss, RssAccept, RssReject } from '@rss/entity/rss.entity';

@Injectable()
export class RssRepository extends Repository<Rss> {
  constructor(private dataSource: DataSource) {
    super(Rss, dataSource.createEntityManager());
  }
}

@Injectable()
export class RssRejectRepository extends Repository<RssReject> {
  constructor(private dataSource: DataSource) {
    super(RssReject, dataSource.createEntityManager());
  }
}

@Injectable()
export class RssAcceptRepository extends Repository<RssAccept> {
  constructor(private readonly dataSource: DataSource) {
    super(RssAccept, dataSource.createEntityManager());
  }

  countByBlogPlatform() {
    return this.createQueryBuilder()
      .select('blog_platform', 'platform')
      .addSelect('COUNT(blog_platform)', 'count')
      .groupBy('blog_platform')
      .orderBy('count', 'DESC')
      .getRawMany();
  }

  findRecentlyPublished(limit: number) {
    return this.createQueryBuilder('rss')
      .innerJoin(
        'feed',
        'feed',
        'feed.blog_id = rss.id AND feed.is_public = 1',
      )
      .select('rss.id', 'id')
      .addSelect('rss.name', 'name')
      .addSelect('rss.blog_platform', 'blogPlatform')
      .addSelect('MAX(feed.created_at)', 'lastPublishedAt')
      .groupBy('rss.id')
      .orderBy('MAX(feed.created_at)', 'DESC')
      .limit(limit)
      .getRawMany<{
        id: number;
        name: string;
        blogPlatform: string;
        lastPublishedAt: Date;
      }>();
  }
}
