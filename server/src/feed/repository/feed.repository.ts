import { Injectable } from '@nestjs/common';

import { Brackets, DataSource, Repository } from 'typeorm';

import { ReadFeedPaginationRequestDto } from '@feed/dto/request/readFeedPagination.dto';
import { SearchType } from '@feed/dto/request/searchFeed.dto';
import { Feed, FeedView } from '@feed/entity/feed.entity';

@Injectable()
export class FeedRepository extends Repository<Feed> {
  constructor(private dataSource: DataSource) {
    super(Feed, dataSource.createEntityManager());
  }

  async searchFeedList(
    find: string,
    limit: number,
    type: SearchType,
    offset: number,
  ) {
    const queryBuilder = this.createQueryBuilder('feed')
      .innerJoinAndSelect('feed.blog', 'rss_accept')
      .addSelect(this.getMatchAgainstExpression(type, 'find'), 'relevance')
      .where(this.getWhereCondition(type), { find })
      .orderBy('relevance', 'DESC')
      .addOrderBy('feed.createdAt', 'DESC')
      .skip(offset)
      .take(limit);

    return queryBuilder.getManyAndCount();
  }

  private getMatchAgainstExpression(type: string, parameter: string): string {
    switch (type) {
      case 'title':
        return `MATCH(feed.title) AGAINST (:${parameter} IN NATURAL LANGUAGE MODE)`;
      case 'blogName':
        return `MATCH(rss_accept.name) AGAINST (:${parameter} IN NATURAL LANGUAGE MODE)`;
      case 'all':
        return `(MATCH(feed.title) AGAINST (:${parameter} IN NATURAL LANGUAGE MODE) + MATCH(rss_accept.name) AGAINST (:${parameter} IN NATURAL LANGUAGE MODE))`;
    }
  }

  private getWhereCondition(type: string): string {
    switch (type) {
      case 'title':
        return 'MATCH(feed.title) AGAINST (:find IN NATURAL LANGUAGE MODE)';
      case 'blogName':
        return 'MATCH(rss_accept.name) AGAINST (:find IN NATURAL LANGUAGE MODE)';
      case 'all':
        return '(MATCH(feed.title) AGAINST (:find IN NATURAL LANGUAGE MODE) OR MATCH(rss_accept.name) AGAINST (:find IN NATURAL LANGUAGE MODE))';
    }
  }

  async findAllStatisticsOrderByViewCount(limit: number) {
    return this.find({
      select: ['id', 'title', 'viewCount'],
      order: {
        viewCount: 'DESC',
      },
      take: limit,
    });
  }
}

@Injectable()
export class FeedViewRepository extends Repository<FeedView> {
  constructor(private dataSource: DataSource) {
    super(FeedView, dataSource.createEntityManager());
  }

  async findFeedPagination(
    feedPaginationQueryDto: ReadFeedPaginationRequestDto,
  ) {
    const { lastId, limit, tags } = feedPaginationQueryDto;

    const query = this.createQueryBuilder().where((qb) => {
      if (lastId) {
        const subQuery = qb
          .subQuery()
          .select('order_id')
          .from('feed_view', 'fv')
          .where('fv.id = :lastId', { lastId })
          .getQuery();
        return `order_id < (${subQuery})`;
      }
      return '';
    });

    if (tags) {
      if (typeof tags === 'string') {
        query.andWhere('JSON_CONTAINS(tag, :tag) = 1', {
          tag: JSON.stringify(tags),
        });
      } else {
        query.andWhere(
          new Brackets((qb) => {
            tags.forEach((tag, index) => {
              qb.orWhere(`JSON_CONTAINS(tag, :tag${index}) = 1`, {
                [`tag${index}`]: JSON.stringify(tag),
              });
            });
          }),
        );
      }
    }

    query.orderBy('order_id', 'DESC').take(limit + 1);

    return await query.getMany();
  }
}
