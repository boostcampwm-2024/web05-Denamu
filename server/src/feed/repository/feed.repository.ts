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
      .andWhere('feed.is_public = 1')
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

  async getFeedsByBlog(
    blogId: number,
    lastId: number,
    limit: number,
    onlyPublic: boolean,
  ) {
    const query = this.createQueryBuilder('feed')
      .select([
        'feed.id',
        'feed.title',
        'feed.path',
        'feed.createdAt',
        'feed.commentCount',
        'feed.likeCount',
        'feed.isPublic',
      ])
      .where('feed.blog_id = :blogId', { blogId });

    if (onlyPublic) {
      query.andWhere('feed.is_public = 1');
    }

    if (lastId) {
      query.andWhere('feed.id < :lastId', { lastId });
    }

    return await query
      .orderBy('feed.id', 'DESC')
      .take(limit + 1)
      .getMany();
  }

  async countPublicFeedsByBlogIds(
    blogIds: number[],
  ): Promise<Map<number, number>> {
    if (!blogIds.length) return new Map();

    const rows = await this.createQueryBuilder('feed')
      .select('feed.blog_id', 'blogId')
      .addSelect('COUNT(*)', 'count')
      .where('feed.blog_id IN (:...blogIds)', { blogIds })
      .andWhere('feed.is_public = 1')
      .groupBy('feed.blog_id')
      .getRawMany();

    return new Map(
      rows.map((row: { blogId: number; count: number }) => [
        Number(row.blogId),
        Number(row.count),
      ]),
    );
  }

  async setVisibilityForBlog(
    feedId: number,
    blogId: number,
    isPublic: boolean,
  ) {
    const result = await this.createQueryBuilder()
      .update(Feed)
      .set({ isPublic })
      .where('id = :feedId AND blog_id = :blogId', { feedId, blogId })
      .execute();

    return result.affected ?? 0;
  }

  async isOwnedByUser(feedId: number, userId: number): Promise<boolean> {
    const count = await this.createQueryBuilder('feed')
      .innerJoin('feed.blog', 'blog')
      .where('feed.id = :feedId', { feedId })
      .andWhere('blog.user_id = :userId', { userId })
      .getCount();

    return count > 0;
  }

  async findAllStatisticsOrderByViewCount(limit: number) {
    return this.find({
      select: ['id', 'title', 'viewCount'],
      where: {
        isPublic: true,
      },
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
