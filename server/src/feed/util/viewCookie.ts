import { Response } from 'express';

import { cookieConfig } from '@common/cookie/cookie.config';
import { getKstMidnightInstant } from '@common/util/kstDate';

export function isString(ip: string | string[]): ip is string {
  return !Array.isArray(ip);
}

function getExpirationTime() {
  return getKstMidnightInstant(new Date(), 1);
}

export function createCookie(response: Response, feedId: number) {
  const cookieConfigWithExpiration = {
    ...cookieConfig[process.env.NODE_ENV],
    expires: getExpirationTime(),
  };
  response.cookie(`View_count_${feedId}`, feedId, cookieConfigWithExpiration);
}
