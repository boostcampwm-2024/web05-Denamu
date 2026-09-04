import { Injectable } from '@nestjs/common';

import {
  Brackets,
  DataSource,
  In,
  IsNull,
  LessThan,
  Raw,
  Repository,
} from 'typeorm';

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
    blockerId?: number,
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

    if (blockerId) {
      queryBuilder.andWhere(
        'feed.blog_id NOT IN (SELECT rss_block.blocked_rss_id FROM rss_blocks rss_block WHERE rss_block.blocker_id = :blockerId)',
        { blockerId },
      );
    }

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
    date?: string,
  ) {
    return this.find({
      where: {
        blog: { id: blogId },
        ...(onlyPublic && { isPublic: true }),
        ...(lastId && { id: LessThan(lastId) }),
        // 잔디 집계(DATE_FORMAT 기준)와 동일한 날짜 범위. 인덱스 활용을 위해 범위 조건 사용.
        ...(date && {
          createdAt: Raw(
            (alias) =>
              `${alias} >= :date AND ${alias} < DATE_ADD(:date, INTERVAL 1 DAY)`,
            { date },
          ),
        }),
      },
      select: [
        'id',
        'title',
        'path',
        'thumbnail',
        'createdAt',
        'commentCount',
        'likeCount',
        'isPublic',
      ],
      order: { id: 'DESC' },
      take: limit + 1,
    });
  }

  async getLatestPublicFeedDate(blogId: number): Promise<Date | null> {
    const row = await this.createQueryBuilder('feed')
      .select('MAX(feed.created_at)', 'latest')
      .where('feed.blog_id = :blogId', { blogId })
      .andWhere('feed.is_public = 1')
      .getRawOne<{ latest: Date | null }>();

    return row?.latest ?? null;
  }

  async findPublishActivityByBlogAndYear(
    blogId: number,
    year: number,
  ): Promise<Array<{ date: string; count: number }>> {
    const rows = await this.createQueryBuilder('feed')
      .select("DATE_FORMAT(feed.created_at, '%Y-%m-%d')", 'date')
      .addSelect('COUNT(*)', 'count')
      .where('feed.blog_id = :blogId', { blogId })
      .andWhere('feed.is_public = 1')
      .andWhere('YEAR(feed.created_at) = :year', { year })
      .groupBy('date')
      .orderBy('date', 'ASC')
      .getRawMany<{ date: string; count: number }>();

    return rows.map((row) => ({ date: row.date, count: Number(row.count) }));
  }

  async findPublishYearsByBlogId(blogId: number): Promise<number[]> {
    const rows = await this.createQueryBuilder('feed')
      .select('DISTINCT YEAR(feed.created_at)', 'year')
      .where('feed.blog_id = :blogId', { blogId })
      .andWhere('feed.is_public = 1')
      .orderBy('year', 'DESC')
      .getRawMany<{ year: number }>();

    return rows.map((row) => Number(row.year));
  }

  async getLatestPublicFeedDateByBlogIds(
    blogIds: number[],
  ): Promise<Map<number, Date>> {
    if (!blogIds.length) return new Map();

    const rows = await this.createQueryBuilder('feed')
      .select('feed.blog_id', 'blogId')
      .addSelect('MAX(feed.created_at)', 'latest')
      .where('feed.blog_id IN (:...blogIds)', { blogIds })
      .andWhere('feed.is_public = 1')
      .groupBy('feed.blog_id')
      .getRawMany<{ blogId: number; latest: Date }>();

    return new Map(rows.map((row) => [Number(row.blogId), row.latest]));
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
    const result = await this.update(
      { id: feedId, blog: { id: blogId } },
      { isPublic },
    );

    return result.affected ?? 0;
  }

  async isOwnedByUser(feedId: number, userId: number): Promise<boolean> {
    return this.exists({ where: { id: feedId, blog: { userId } } });
  }

  async getBlogMetaByFeedId(feedId: number): Promise<{
    id: number;
    userName: string;
    owner: { id: number; userName: string; profileImage: string | null } | null;
  } | null> {
    const feed = await this.findOne({
      where: { id: feedId },
      relations: { blog: { user: true } },
      select: {
        id: true,
        blog: {
          id: true,
          userName: true,
          user: { id: true, userName: true, profileImage: true },
        },
      },
    });

    if (!feed?.blog) return null;

    return {
      id: feed.blog.id,
      userName: feed.blog.userName,
      owner: feed.blog.user
        ? {
            id: feed.blog.user.id,
            userName: feed.blog.user.userName,
            profileImage: feed.blog.user.profileImage ?? null,
          }
        : null,
    };
  }

  async getSubscriptionFeeds(blogIds: number[], lastId: number, limit: number) {
    if (!blogIds.length) return [];

    return this.find({
      where: {
        blog: { id: In(blogIds) },
        isPublic: true,
        ...(lastId && { id: LessThan(lastId) }),
      },
      relations: { blog: true, tags: true },
      order: { id: 'DESC' },
      take: limit + 1,
    });
  }

  async findFeedsWithoutSummary() {
    return this.find({
      where: [
        { isPublic: true, summary: IsNull() },
        { isPublic: true, summary: '' },
      ],
      select: ['id', 'title', 'likeCount', 'commentCount'],
      order: { id: 'DESC' },
    });
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
    blockerId?: number,
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

    if (blockerId) {
      query.andWhere(
        'id NOT IN (SELECT f.id FROM feed f INNER JOIN rss_blocks rss_block ON rss_block.blocked_rss_id = f.blog_id WHERE rss_block.blocker_id = :blockerId)',
        { blockerId },
      );
    }

    query.orderBy('order_id', 'DESC').take(limit + 1);

    return await query.getMany();
  }
}
