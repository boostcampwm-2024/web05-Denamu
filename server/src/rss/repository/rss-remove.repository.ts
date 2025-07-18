import { DataSource, Repository } from 'typeorm';
import { RssRemoveRequest } from '../entity/rss-remove.entity';
import { Injectable } from '@nestjs/common';

@Injectable()
export class RssRemoveRepository extends Repository<RssRemoveRequest> {
  constructor(private dataSource: DataSource) {
    super(RssRemoveRequest, dataSource.createEntityManager());
  }
}
