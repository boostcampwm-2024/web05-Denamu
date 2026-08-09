import { Injectable } from '@nestjs/common';

import { DataSource, Repository } from 'typeorm';

import { RssSuspension } from '@suspension/entity/rssSuspension.entity';

@Injectable()
export class RssSuspensionRepository extends Repository<RssSuspension> {
  constructor(private dataSource: DataSource) {
    super(RssSuspension, dataSource.createEntityManager());
  }
}
