import { DataSource, Repository } from 'typeorm';
import { Feed, FeedView } from '../entity/feed.entity';
import { Injectable } from '@nestjs/common';
import { FeedPaginationRequestDto } from '../dto/request/feed-pagination.dto';
import { SearchType } from '../dto/request/search-feed.dto';

@Injectable()
export class FeedRepository extends Repository<Feed> {
  constructor(private dataSource: DataSource) {
    super(Feed, dataSource.createEntityManager());
  }

  async searchFeedListWithTags(
    feedPaginationQueryDto: FeedPaginationRequestDto,
  ) {
    const { lastId, limit, tags } = feedPaginationQueryDto;

    const qb = this.createQueryBuilder('feed')
      .leftJoinAndSelect('feed.tag', 'tag_map')
      .leftJoinAndSelect('feed.blog', 'rss_accept')
      .select('feed')
      .addSelect('ROW_NUMBER() OVER (ORDER BY feed.created_at) AS order_id')
      .where((qb) => {
        if (lastId) {
          const subQuery = qb
            .subQuery()
            .select('order_id')
            .from('feed', 'f')
            .addSelect('ROW_NUMBER() OVER (ORDER BY f.created_at)', 'order_id')
            .where('f.id = :lastId', { lastId })
            .getQuery();
          return `order_id < (${subQuery})`;
        }
        return '1=1';
      })
      .andWhere(tags && tags.length ? 'tag_map.tag IN (:...tags)' : '1=1', {
        tags,
      });

    qb.groupBy('feed.id')
      .addSelect('GROUP_CONCAT(DISTINCT tag_map.tag)', 'tag')
      .orderBy('feed.created_at', 'DESC')
      .limit(limit + 1);

    const { raw, entities } = await qb.getRawAndEntities();
    entities.forEach((feed, index) => {
      feed.tag = raw[index].tag;
    });
    return entities;
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

  async findFeedPagination(feedPaginationQueryDto: FeedPaginationRequestDto) {
    const { lastId, limit } = feedPaginationQueryDto;

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

    query.orderBy('order_id', 'DESC').take(limit + 1);

    return await query.getMany();
  }

  async findFeedById(feedId: number) {
    const feed = await this.createQueryBuilder()
      .where('id = :feedId', { feedId })
      .getOne();
    return feed;
  }
}
