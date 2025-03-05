import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { RedisService } from '../redis/redis.service';
import { Request } from 'express';

@Injectable()
export class CookieAuthGuard implements CanActivate {
  constructor(private readonly redisService: RedisService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const sid = request.cookies['sessionId'];
    const loginId = await this.redisService.get(`auth:${sid}`);
    if (!loginId) {
      throw new UnauthorizedException('인증되지 않은 요청입니다.');
    }

    request['user'] = { loginId };

    return true;
  }
}
