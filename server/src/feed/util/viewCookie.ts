import { Request, Response } from 'express';

import { cookieConfig } from '@common/cookie/cookie.config';

export function isString(ip: string | string[]): ip is string {
  return !Array.isArray(ip);
}

export function getIp(request: Request) {
  const forwardedFor = request.headers['x-forwarded-for'];

  if (typeof forwardedFor === 'string') {
    const forwardedIps = forwardedFor.split(',');
    return forwardedIps[0].trim();
  }

  return request.socket.remoteAddress;
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
