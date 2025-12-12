import { User } from '../../src/user/entity/user.entity';
import * as bcrypt from 'bcrypt';

export class UserFixture {
  static readonly GENERAL_USER = {
    email: 'test1234@test.com',
    password: 'test1234!',
    userName: 'test1234',
    maxStreak: 15,
    currentStreak: 7,
    totalViews: 120,
  };

  static async createUserCryptFixture(overwrites: Partial<User> = {}) {
    const user = new User();
    Object.assign(user, this.GENERAL_USER);
    Object.assign(user, overwrites);
    user.password = await bcrypt.hash(user.password, 1);
    return user;
  }

  static createUserFixture(overwrites: Partial<User> = {}) {
    const user = new User();
    Object.assign(user, this.GENERAL_USER);
    Object.assign(user, overwrites);
    return user;
  }
}
