import { Injectable } from '@nestjs/common';

import { DataSource, Repository } from 'typeorm';

import { RssBlock } from '@block/entity/rssBlock.entity';

@Injectable()
export class RssBlockRepository extends Repository<RssBlock> {
  constructor(private dataSource: DataSource) {
    super(RssBlock, dataSource.createEntityManager());
  }

  async getBlockedRssList(blockerId: number) {
    return await this.createQueryBuilder('rssBlock')
      .innerJoin('rssBlock.blockedRss', 'blockedRss')
      .select(['rssBlock.id', 'rssBlock.createdAt'])
      .addSelect(['blockedRss.id', 'blockedRss.name', 'blockedRss.blogPlatform', 'blockedRss.blogImage'])
      .where('rssBlock.blocker_id = :blockerId', { blockerId })
      .orderBy('rssBlock.id', 'DESC')
      .getMany();
  }

  async getBlockedRssIds(blockerId: number) {
    const rssBlocks = await this.createQueryBuilder('rssBlock')
      .select('rssBlock.blocked_rss_id', 'blockedRssId')
      .where('rssBlock.blocker_id = :blockerId', { blockerId })
      .getRawMany<{ blockedRssId: number }>();
    return rssBlocks.map((rssBlock) => rssBlock.blockedRssId);
  }

  async existsByBlockerAndRss(blockerId: number, rssId: number) {
    const count = await this.createQueryBuilder('rssBlock')
      .where('rssBlock.blocker_id = :blockerId', { blockerId })
      .andWhere('rssBlock.blocked_rss_id = :rssId', { rssId })
      .getCount();
    return count > 0;
  }
}
