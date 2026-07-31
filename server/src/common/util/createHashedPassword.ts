import * as bcrypt from 'bcrypt';

const SALT_ROUNDS = 10;

export async function createHashedPassword(password: string) {
  return await bcrypt.hash(password, SALT_ROUNDS);
}
