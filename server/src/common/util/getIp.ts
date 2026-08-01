import { Request } from 'express';

/**
 * nginx가 X-Real-IP를 $remote_addr로 무조건 덮어써 설정하므로 신뢰 가능.
 * X-Forwarded-For는 $proxy_add_x_forwarded_for(append 방식)라 클라이언트가
 * 임의 값을 앞에 붙여 위조할 수 있어 사용하지 않는다.
 */
export function getIp(request: Request) {
  const realIp = request.headers['x-real-ip'];

  if (typeof realIp === 'string') {
    return realIp;
  }

  return request.socket.remoteAddress;
}
