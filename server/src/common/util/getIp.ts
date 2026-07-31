import { Request } from 'express';

export function getIp(request: Request) {
  const forwardedFor = request.headers['x-forwarded-for'];

  if (typeof forwardedFor === 'string') {
    const forwardedIps = forwardedFor.split(',');
    return forwardedIps[0].trim();
  }

  return request.socket.remoteAddress;
}
