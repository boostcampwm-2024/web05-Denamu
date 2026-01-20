import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import { Request } from 'express';

import { REDIS_KEYS } from '@common/redis/redis.constant';
import { RedisService } from '@common/redis/redis.service';

@Injectable()
export class AdminAuthGuard implements CanActivate {
  constructor(private readonly redisService: RedisService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const sid = request.cookies['sessionId'];
    const loginId = await this.redisService.get(
      `${REDIS_KEYS.ADMIN_AUTH_KEY}:${sid}`,
    );
    if (!loginId) {
      throw new UnauthorizedException('인증되지 않은 요청입니다.');
    }

    request['user'] = { loginId };

    return true;
  }
}
