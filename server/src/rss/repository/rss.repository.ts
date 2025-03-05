import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Rss, RssAccept, RssReject } from '../entity/rss.entity';
import { RssRegisterRequestDto } from '../dto/request/rss-register.dto';

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
}
