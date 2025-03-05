import { Admin } from '../../src/admin/entity/admin.entity';
import * as bcrypt from 'bcrypt';

export class AdminFixture {
  static readonly GENERAL_ADMIN = {
    loginId: 'test1234',
    password: 'test1234!',
  };
  static async createAdminCryptFixture(overwrites: Partial<Admin> = {}) {
    const admin = new Admin();
    Object.assign(admin, this.GENERAL_ADMIN);
    Object.assign(admin, overwrites);
    admin.password = await bcrypt.hash(admin.password, 1);
    return admin;
  }

  static createAdminFixture(overwrites: Partial<Admin> = {}) {
    const admin = new Admin();
    Object.assign(admin, this.GENERAL_ADMIN);
    Object.assign(admin, overwrites);
    return admin;
  }
}
