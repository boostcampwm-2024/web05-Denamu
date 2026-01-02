import { User } from '../../../../src/user/entity/user.entity';
import * as bcrypt from 'bcrypt';
import * as uuid from 'uuid';
import { SALT_ROUNDS } from '../../../../src/user/constant/user.constants';

export const USER_DEFAULT_PASSWORD = 'test1234!';

export class UserFixture {
  static createGeneralUser() {
    return {
      email: `test${uuid.v4()}@test.com`,
      password: USER_DEFAULT_PASSWORD,
      userName: 'test1234',
      maxStreak: 15,
      currentStreak: 7,
      totalViews: 120,
    };
  }

  static async createUserCryptFixture(overwrites: Partial<User> = {}) {
    const user = new User();
    Object.assign(user, this.createGeneralUser(), overwrites);
    user.password = await bcrypt.hash(user.password, SALT_ROUNDS);
    return user;
  }

  static createUserFixture(overwrites: Partial<User> = {}) {
    const user = new User();
    return Object.assign(user, this.createGeneralUser(), overwrites);
  }
}
