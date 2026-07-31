import * as bcrypt from 'bcrypt';

import { SALT_ROUNDS } from '@user/constant/user.constants';

export async function createHashedPassword(password: string) {
  return await bcrypt.hash(password, SALT_ROUNDS);
}
