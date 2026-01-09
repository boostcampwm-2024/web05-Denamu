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
}
