import { Injectable } from '@nestjs/common';

import { DataSource, Repository } from 'typeorm';

import { Provider } from '@user/entity/provider.entity';

@Injectable()
export class ProviderRepository extends Repository<Provider> {
  constructor(private dataSource: DataSource) {
    super(Provider, dataSource.createEntityManager());
  }

  async findByProviderTypeAndId(providerType: string, providerUserId: string) {
    return this.findOne({
      where: {
        providerType,
        providerUserId,
      },
      relations: ['user'],
    });
  }

  async findByUserId(userId: number) {
    return this.find({
      where: { user: { id: userId } },
      order: { createdAt: 'ASC' },
    });
  }

  async findByUserIdAndType(userId: number, providerType: string) {
    return this.findOne({
      where: { user: { id: userId }, providerType },
    });
  }
}
