import { Socket } from 'socket.io';

export function getWsIp(client: Socket): string | undefined {
  const realIp = client.handshake.headers['x-real-ip'];

  if (typeof realIp === 'string') {
    return realIp;
  }

  return client.handshake.address;
}
