import { Injectable } from '@nestjs/common';

import { DataSource, LessThan, Repository } from 'typeorm';

import { Subscription } from '@subscribe/entity/subscription.entity';

@Injectable()
export class SubscriptionRepository extends Repository<Subscription> {
  constructor(private dataSource: DataSource) {
    super(Subscription, dataSource.createEntityManager());
  }

  async getSubscribedBlogIds(userId: number): Promise<number[]> {
    const rows = await this.find({
      where: { user: { id: userId } },
      relations: { rssAccept: true },
      select: { id: true, rssAccept: { id: true } },
    });

    return rows.map((row) => row.rssAccept.id);
  }

  async countByBlogId(blogId: number): Promise<number> {
    return this.countBy({ rssAccept: { id: blogId } });
  }

  async getSubscriberIdsByBlog(blogId: number): Promise<number[]> {
    const rows = await this.find({
      where: { rssAccept: { id: blogId } },
      relations: { user: true },
      select: { id: true, user: { id: true } },
    });

    return rows.map((row) => row.user.id);
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
    return this.find({
      where: {
        rssAccept: { id: blogId },
        ...(lastId && { id: LessThan(lastId) }),
      },
      relations: { user: true },
      select: {
        id: true,
        user: { id: true, userName: true, profileImage: true },
      },
      order: { id: 'DESC' },
      take: limit + 1,
    });
  }
}
