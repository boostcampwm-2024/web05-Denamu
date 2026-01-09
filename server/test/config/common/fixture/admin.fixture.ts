import { Admin } from '@src/admin/entity/admin.entity';
import * as bcrypt from 'bcrypt';
import * as uuid from 'uuid';
import { SALT_ROUNDS } from '@src/user/constant/user.constants';

export const ADMIN_DEFAULT_PASSWORD = 'test1234!';

export class AdminFixture {
  static createGeneralAdmin() {
    return {
      loginId: `test${uuid.v4()}`,
      password: ADMIN_DEFAULT_PASSWORD,
    };
  }

  static async createAdminCryptFixture(overwrites: Partial<Admin> = {}) {
    const admin = new Admin();
    Object.assign(admin, this.createGeneralAdmin(), overwrites);
    admin.password = await bcrypt.hash(admin.password, SALT_ROUNDS);
    return admin;
  }

  static createAdminFixture(overwrites: Partial<Admin> = {}) {
    const admin = new Admin();
    return Object.assign(admin, this.createGeneralAdmin(), overwrites);
  }
}
