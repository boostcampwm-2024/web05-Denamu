import * as uuid from 'uuid';

import { Admin } from '@admin/entity/admin.entity';

import { createHashedPassword } from '@common/util/createHashedPassword';

export const ADMIN_DEFAULT_PASSWORD = 'test1234!';

export class AdminFixture {
  static createGeneralAdmin() {
    return {
      password: ADMIN_DEFAULT_PASSWORD,
      name: `name${uuid.v4()}`,
      email: `admin${uuid.v4()}@test.com`,
    };
  }

  static async createAdminCryptFixture(overwrites: Partial<Admin> = {}) {
    const admin = new Admin();
    Object.assign(admin, this.createGeneralAdmin(), overwrites);
    admin.password = await createHashedPassword(admin.password);
    return admin;
  }

  static createAdminFixture(overwrites: Partial<Admin> = {}) {
    const admin = new Admin();
    return Object.assign(admin, this.createGeneralAdmin(), overwrites);
  }
}
