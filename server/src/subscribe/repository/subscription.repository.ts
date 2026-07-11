import { Injectable } from '@nestjs/common';

import { DataSource, Repository } from 'typeorm';

import { Subscription } from '@subscribe/entity/subscription.entity';

@Injectable()
export class SubscriptionRepository extends Repository<Subscription> {
  constructor(private dataSource: DataSource) {
    super(Subscription, dataSource.createEntityManager());
  }

  async getSubscribedBlogIds(userId: number): Promise<number[]> {
    const rows = await this.createQueryBuilder('subscription')
      .select('subscription.rss_accept_id', 'rssAcceptId')
      .where('subscription.user_id = :userId', { userId })
      .getRawMany();

    return rows.map((row: { rssAcceptId: number }) => Number(row.rssAcceptId));
  }

  async countByBlogId(blogId: number): Promise<number> {
    return this.countBy({ rssAccept: { id: blogId } });
  }

  async countByBlogIds(blogIds: number[]): Promise<Map<number, number>> {
    if (!blogIds.length) return new Map();

    const rows = await this.createQueryBuilder('subscription')
      .select('subscription.rss_accept_id', 'blogId')
      .addSelect('COUNT(*)', 'count')
      .where('subscription.rss_accept_id IN (:...blogIds)', { blogIds })
      .groupBy('subscription.rss_accept_id')
      .getRawMany();

    return new Map(
      rows.map((row: { blogId: number; count: number }) => [
        Number(row.blogId),
        Number(row.count),
      ]),
    );
  }

  async getSubscribersByBlog(blogId: number, lastId: number, limit: number) {
    const query = this.createQueryBuilder('subscription')
      .innerJoin('subscription.user', 'user')
      .select(['subscription.id'])
      .addSelect(['user.id', 'user.userName', 'user.profileImage'])
      .where('subscription.rss_accept_id = :blogId', { blogId });

    if (lastId) {
      query.andWhere('subscription.id < :lastId', { lastId });
    }

    return await query
      .orderBy('subscription.id', 'DESC')
      .take(limit + 1)
      .getMany();
  }
}
