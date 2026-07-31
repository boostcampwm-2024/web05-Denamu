import { Response } from 'express';

import { cookieConfig } from '@common/cookie/cookie.config';

export function isString(ip: string | string[]): ip is string {
  return !Array.isArray(ip);
}

function getExpirationTime() {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  return tomorrow;
}

export function createCookie(response: Response, feedId: number) {
  const cookieConfigWithExpiration = {
    ...cookieConfig[process.env.NODE_ENV],
    expires: getExpirationTime(),
  };
  response.cookie(`View_count_${feedId}`, feedId, cookieConfigWithExpiration);
}
