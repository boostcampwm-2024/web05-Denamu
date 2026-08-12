import { Injectable } from '@nestjs/common';

import { DataSource, Repository } from 'typeorm';

import { REJOIN_RESTRICTION_MONTHS } from '@user/constant/user.constants';
import { WithdrawnUser } from '@user/entity/withdrawnUser.entity';

@Injectable()
export class WithdrawnUserRepository extends Repository<WithdrawnUser> {
  constructor(private dataSource: DataSource) {
    super(WithdrawnUser, dataSource.createEntityManager());
  }

  async getRejoinAvailableAt(email: string): Promise<Date | null> {
    const record = await this.findOne({ where: { email } });

    if (!record) {
      return null;
    }

    const availableAt = new Date(record.withdrawnAt);
    availableAt.setMonth(availableAt.getMonth() + REJOIN_RESTRICTION_MONTHS);

    return availableAt > new Date() ? availableAt : null;
  }
}
