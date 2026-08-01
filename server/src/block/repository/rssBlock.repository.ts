import { Injectable } from '@nestjs/common';

import { DataSource, Repository } from 'typeorm';

import { RssBlock } from '@block/entity/rssBlock.entity';

@Injectable()
export class RssBlockRepository extends Repository<RssBlock> {
  constructor(private dataSource: DataSource) {
    super(RssBlock, dataSource.createEntityManager());
  }

  async getBlockedRssList(blockerId: number) {
    return this.find({
      where: { blocker: { id: blockerId } },
      relations: { blockedRss: true },
      select: {
        id: true,
        createdAt: true,
        blockedRss: {
          id: true,
          name: true,
          blogPlatform: true,
          blogImage: true,
        },
      },
      order: { id: 'DESC' },
    });
  }

  async getBlockedRssIds(blockerId: number) {
    const rssBlocks = await this.find({
      where: { blocker: { id: blockerId } },
      relations: { blockedRss: true },
      select: { blockedRss: { id: true } },
    });
    return rssBlocks.map((rssBlock) => rssBlock.blockedRss.id);
  }

  async existsByBlockerAndRss(blockerId: number, rssId: number) {
    return this.exists({
      where: { blocker: { id: blockerId }, blockedRss: { id: rssId } },
    });
  }
}
